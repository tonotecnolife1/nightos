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
import { toMentionCustomer } from "@/features/team-chat/lib/customer-mention";
import { getCurrentCastId } from "@/lib/nightos/auth";
import { mockCasts } from "@/lib/nightos/mock-data";
import { getCustomersForCast } from "@/lib/nightos/supabase-queries";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { ChatMessage, ChatRoom } from "@/features/team-chat/types";

export const dynamic = "force-dynamic";

export default async function ChatRoomPage({
  params,
}: {
  params: { id: string };
}) {
  const castId = await getCurrentCastId();

  const [{ room, messages }, customers] = await Promise.all([
    resolveRoom(params.id, castId),
    getCustomersForCast(castId),
  ]);
  if (!room) notFound();

  const currentCast = mockCasts.find((c) => c.id === castId);
  const castName = currentCast?.name ?? "あかり";

  return (
    <ChatRoomView
      room={room}
      messages={messages}
      currentCastId={castId}
      currentCastName={castName}
      customers={customers.map(toMentionCustomer)}
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
  // cast ID 自体に "_" を含む（例: cast_help2）ため単純 split できない。
  // 既知の cast ID の組み合わせから一致するペアを探して復元する。
  if (id.startsWith("dm_")) {
    const suffix = id.slice(3);
    const known = [
      ...mockStoreCasts.map((c) => ({ id: c.id, name: c.name })),
      ...mockCasts.map((c) => ({ id: c.id, name: c.name })),
    ];
    const partner = known.find(
      (c) =>
        c.id !== castId &&
        [castId, c.id].sort().join("_") === suffix,
    );
    if (partner) {
      const selfName =
        known.find((c) => c.id === castId)?.name ?? "あなた";
      const ordered = [
        { id: castId, name: selfName },
        { id: partner.id, name: partner.name },
      ];
      const room: ChatRoom = {
        id,
        store_id: "store1",
        type: "dm",
        name: null,
        member_ids: ordered.map((c) => c.id),
        member_names: ordered.map((c) => c.name),
        visible_to_seniors: false,
        created_at: new Date().toISOString(),
      };
      return { room, messages: [] };
    }
  }

  return { room: null, messages: [] };
}
