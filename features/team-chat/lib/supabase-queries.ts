import { randomUUID } from "crypto";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { ChatMessage, ChatRoom, ChatRoomType } from "../types";

/**
 * Supabase-backed queries for team chat. Each helper returns null when
 * the tables are missing so the caller can fall back to mock data.
 */

interface RoomRow {
  id: string;
  store_id: string | null;
  type: ChatRoomType;
  name: string | null;
  visible_to_seniors: boolean | null;
  created_at: string;
}

interface MemberRow {
  room_id: string;
  cast_id: string;
  cast: { name: string | null } | { name: string | null }[] | null;
}

interface StoredAttachment {
  path?: string | null;
  url?: string | null;
  mime: string;
  name?: string | null;
  width?: number | null;
  height?: number | null;
}

interface MessageRow {
  id: string;
  room_id: string;
  sender_id: string | null;
  sender_name: string;
  sender_role: string | null;
  content: string;
  attachments: StoredAttachment[] | null;
  customer_id: string | null;
  thread_parent_id: string | null;
  mentions_ai: boolean | null;
  is_bot: boolean | null;
  created_at: string;
  edited_at: string | null;
  deleted_at: string | null;
}

function memberName(m: MemberRow): string | null {
  const cast = m.cast;
  if (!cast) return null;
  if (Array.isArray(cast)) return cast[0]?.name ?? null;
  return cast.name ?? null;
}

function toRoom(
  row: RoomRow,
  members: MemberRow[],
  lastMessage: MessageRow | null,
): ChatRoom {
  const roomMembers = members.filter((m) => m.room_id === row.id);
  return {
    id: row.id,
    store_id: row.store_id ?? "",
    type: row.type,
    name: row.name,
    member_ids: roomMembers.map((m) => m.cast_id),
    member_names: roomMembers.map(
      (m) => memberName(m) ?? m.cast_id,
    ),
    visible_to_seniors: !!row.visible_to_seniors,
    created_at: row.created_at,
    last_message: lastMessage
      ? {
          content: lastMessage.deleted_at
            ? "(削除されたメッセージ)"
            : lastMessage.content,
          sender_name: lastMessage.sender_name,
          sent_at: lastMessage.created_at,
        }
      : undefined,
  };
}

function toMessage(row: MessageRow): ChatMessage {
  return {
    id: row.id,
    room_id: row.room_id,
    sender_id: row.sender_id ?? "",
    sender_name: row.sender_name,
    sender_role: (row.sender_role ?? undefined) as ChatMessage["sender_role"],
    content: row.content,
    attachments: (row.attachments ?? [])
      .map((a) => ({
        url: a.url ?? "",
        path: a.path ?? null,
        mime: a.mime,
        name: a.name ?? null,
        width: a.width ?? null,
        height: a.height ?? null,
      })),
    customer_id: row.customer_id ?? null,
    thread_parent_id: row.thread_parent_id,
    reply_count: 0,
    mentions_ai: !!row.mentions_ai,
    is_bot: !!row.is_bot,
    created_at: row.created_at,
    edited_at: row.edited_at,
    deleted_at: row.deleted_at,
  };
}

/**
 * Replace stored attachment paths with fresh signed URLs so images load even
 * though the bucket is private. Mutates the messages in place. Attachments
 * already carrying an inline URL (mock mode) are left untouched.
 */
async function signAttachments(
  supabase: SupabaseClient,
  messages: ChatMessage[],
): Promise<void> {
  const paths = messages
    .flatMap((m) => m.attachments ?? [])
    .filter((a) => a.path)
    .map((a) => a.path as string);
  if (paths.length === 0) return;

  const { data } = await supabase.storage
    .from("team-chat")
    .createSignedUrls(paths, 60 * 60);
  if (!data) return;

  const byPath = new Map(
    data.filter((d) => d.path).map((d) => [d.path as string, d.signedUrl]),
  );
  for (const m of messages) {
    for (const a of m.attachments ?? []) {
      if (a.path && byPath.has(a.path)) a.url = byPath.get(a.path) ?? a.url;
    }
  }
}

/**
 * Fetch the rooms the given cast belongs to, each decorated with the
 * most recent message preview. Returns null when the schema is missing.
 */
export async function loadChatRoomsForCast(
  supabase: SupabaseClient,
  castId: string,
): Promise<ChatRoom[] | null> {
  const { data: myMemberships, error: memErr } = await supabase
    .from("team_chat_room_members")
    .select("room_id")
    .eq("cast_id", castId);
  if (memErr) return null;

  const roomIds = (myMemberships ?? []).map((r: { room_id: string }) => r.room_id);
  if (roomIds.length === 0) return [];

  const [roomsRes, membersRes, lastMsgsRes] = await Promise.all([
    supabase.from("team_chat_rooms").select("*").in("id", roomIds),
    supabase
      .from("team_chat_room_members")
      .select("room_id, cast_id, cast:nightos_casts(name)")
      .in("room_id", roomIds),
    supabase
      .from("team_chat_messages")
      .select("*")
      .in("room_id", roomIds)
      .order("created_at", { ascending: false }),
  ]);

  if (roomsRes.error || membersRes.error || lastMsgsRes.error) return null;

  const lastByRoom = new Map<string, MessageRow>();
  for (const row of (lastMsgsRes.data ?? []) as MessageRow[]) {
    if (!lastByRoom.has(row.room_id)) lastByRoom.set(row.room_id, row);
  }

  const rooms = (roomsRes.data ?? []) as RoomRow[];
  const members = (membersRes.data ?? []) as MemberRow[];
  return rooms.map((r) => toRoom(r, members, lastByRoom.get(r.id) ?? null));
}

/**
 * Load a single room with its members. Returns null when the room is
 * missing or the cast has no access, or when the schema is missing.
 */
export async function loadChatRoom(
  supabase: SupabaseClient,
  roomId: string,
  castId: string,
): Promise<ChatRoom | null> {
  const { data: membership, error: memErr } = await supabase
    .from("team_chat_room_members")
    .select("room_id")
    .eq("room_id", roomId)
    .eq("cast_id", castId)
    .maybeSingle();
  if (memErr || !membership) return null;

  const [roomRes, membersRes] = await Promise.all([
    supabase.from("team_chat_rooms").select("*").eq("id", roomId).maybeSingle(),
    supabase
      .from("team_chat_room_members")
      .select("room_id, cast_id, cast:nightos_casts(name)")
      .eq("room_id", roomId),
  ]);
  if (roomRes.error || !roomRes.data) return null;
  if (membersRes.error) return null;

  return toRoom(
    roomRes.data as RoomRow,
    (membersRes.data ?? []) as MemberRow[],
    null,
  );
}

export interface CastMember {
  id: string;
  name: string;
}

/**
 * Fetch all cast members who belong to the same store as the given cast,
 * excluding the cast themselves. Returns null when the schema is missing.
 */
export async function getStoreCastsForDm(
  supabase: SupabaseClient,
  castId: string,
): Promise<CastMember[] | null> {
  const { data: self, error: selfErr } = await supabase
    .from("nightos_casts")
    .select("store_id")
    .eq("id", castId)
    .maybeSingle();
  if (selfErr || !self) return null;

  const { data, error } = await supabase
    .from("nightos_casts")
    .select("id, name")
    .eq("store_id", self.store_id)
    .neq("id", castId);
  if (error) return null;

  return (data ?? []).map((r: { id: string; name: string }) => ({
    id: r.id,
    name: r.name ?? r.id,
  }));
}

/**
 * Find an existing DM room between two cast members, or create one.
 * Returns the room ID, or null on failure.
 */
export async function findOrCreateDmRoom(
  supabase: SupabaseClient,
  castIdA: string,
  castIdB: string,
  storeId: string,
): Promise<string | null> {
  // Look for an existing DM room where both are members
  const { data: membershipA } = await supabase
    .from("team_chat_room_members")
    .select("room_id")
    .eq("cast_id", castIdA);

  const { data: membershipB } = await supabase
    .from("team_chat_room_members")
    .select("room_id")
    .eq("cast_id", castIdB);

  if (membershipA && membershipB) {
    const setA = new Set((membershipA).map((m: { room_id: string }) => m.room_id));
    const sharedIds = (membershipB)
      .map((m: { room_id: string }) => m.room_id)
      .filter((id: string) => setA.has(id));

    if (sharedIds.length > 0) {
      // Check if any shared room is a DM type
      const { data: rooms } = await supabase
        .from("team_chat_rooms")
        .select("id, type")
        .in("id", sharedIds)
        .eq("type", "dm");
      if (rooms && rooms.length > 0) return rooms[0].id;
    }
  }

  // Create a new DM room.
  // team_chat_rooms.id is a text PK without a DB default (migration 004),
  // so we must generate the id here — otherwise the insert fails with a
  // not-null violation and the room (and navigation) silently never happens.
  const { data: room, error: roomErr } = await supabase
    .from("team_chat_rooms")
    .insert({ id: `dm_${randomUUID()}`, store_id: storeId, type: "dm", name: null })
    .select("id")
    .single();
  if (roomErr || !room) return null;

  const { error: memberErr } = await supabase
    .from("team_chat_room_members")
    .insert([
      { room_id: room.id, cast_id: castIdA },
      { room_id: room.id, cast_id: castIdB },
    ]);
  if (memberErr) return null;

  return room.id;
}

/**
 * Create a new channel-type group room with the given members.
 * Returns the room ID, or null on failure.
 */
export async function createGroupRoom(
  supabase: SupabaseClient,
  creatorId: string,
  memberIds: string[],
  name: string,
  storeId: string,
): Promise<string | null> {
  // team_chat_rooms.id has no DB default (migration 004) — generate it here.
  const { data: room, error: roomErr } = await supabase
    .from("team_chat_rooms")
    .insert({ id: `group_${randomUUID()}`, store_id: storeId, type: "channel", name, visible_to_seniors: false })
    .select("id")
    .single();
  if (roomErr || !room) return null;

  const allMembers = Array.from(new Set([creatorId, ...memberIds]));
  const { error: memberErr } = await supabase
    .from("team_chat_room_members")
    .insert(allMembers.map((castId) => ({ room_id: room.id, cast_id: castId })));
  if (memberErr) return null;

  return room.id;
}

/**
 * Load all messages for a room, ordered oldest → newest. Populates
 * reply_count from thread_parent_id references.
 */
export async function loadMessages(
  supabase: SupabaseClient,
  roomId: string,
): Promise<ChatMessage[] | null> {
  const { data, error } = await supabase
    .from("team_chat_messages")
    .select("*")
    .eq("room_id", roomId)
    .order("created_at", { ascending: true });
  if (error) return null;

  const rows = (data ?? []) as MessageRow[];
  const messages = rows.map(toMessage);
  await signAttachments(supabase, messages);
  const replyCounts = new Map<string, number>();
  for (const m of messages) {
    if (m.thread_parent_id) {
      replyCounts.set(
        m.thread_parent_id,
        (replyCounts.get(m.thread_parent_id) ?? 0) + 1,
      );
    }
  }
  return messages.map((m) => ({
    ...m,
    reply_count: replyCounts.get(m.id) ?? 0,
  }));
}
