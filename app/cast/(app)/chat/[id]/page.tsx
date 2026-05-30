import { notFound } from "next/navigation";
import { ChatRoomView } from "@/features/team-chat/components/chat-room-view";
import {
  mockChatMessages,
  mockChatRooms,
  mockStoreCasts,
} from "@/features/team-chat/lib/mock-chat-data";
import {
  loadChatRoom,
  loadMessages,
} from "@/features/team-chat/lib/supabase-queries";
import { getCurrentCastId } from "@/lib/nightos/auth";
import { mockCasts } from "@/lib/nightos/mock-data";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { ChatMessage, ChatRoom } from "@/features/team-chat/types";

export const dynamic = "force-dynamic";

export default async function ChatRoomPage({
  params,
}: {
  params: { id: string };
}) {
  const castId = await getCurrentCastId();

  const { room, messages } = await resolveRoom(params.id, castId);
  if (!room) notFound();

  const currentCast = mockCasts.find((c) => c.id === castId);
  const castName = currentCast?.name ?? "あかり";

  return (
    <ChatRoomView
      room={room}
      messages={messages}
      currentCastId={castId}
      currentCastName={castName}
    />
  );
}

async function resolveRoom(
  id: string,
  castId: string,
): Promise<{ room: ChatRoom | null; messages: ChatMessage[] }> {
  if (
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    try {
      const supabase = createServerSupabaseClient();
      const room = await loadChatRoom(supabase, id, castId);
      if (room) {
        const messages = (await loadMessages(supabase, id)) ?? [];
        return { room, messages };
      }
    } catch {
      // fall through to mock
    }
  }

  const mockRoom = mockChatRooms.find((r) => r.id === id) ?? null;
  if (mockRoom) {
    const mockMsgs = mockChatMessages
      .filter((m) => m.room_id === id)
      .sort(
        (a, b) =>
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
      );
    return { room: mockRoom, messages: mockMsgs };
  }

  // 新規作成された合成 DM ID（mock モード）。
  // 既存 room が無いので、ID からメンバーを復元して空ルームを生成する。
  // 合成 ID 形式: `dm_${[castId, recipientId].sort().join("_")}`
  // cast ID は `cast-N`（_ を含まない）なので _ 区切りで安全に分解できる。
  if (id.startsWith("dm_")) {
    const memberIds = id.slice(3).split("_");
    if (memberIds.length === 2 && memberIds.includes(castId)) {
      const nameOf = (cid: string) =>
        mockStoreCasts.find((c) => c.id === cid)?.name ??
        mockCasts.find((c) => c.id === cid)?.name ??
        "キャスト";
      const room: ChatRoom = {
        id,
        type: "dm",
        name: null,
        member_ids: memberIds,
        member_names: memberIds.map(nameOf),
        last_message: null,
        last_message_at: null,
        unread_count: 0,
      };
      return { room, messages: [] };
    }
  }

  return { room: null, messages: [] };
}
