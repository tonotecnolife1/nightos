import { ChatRoomList } from "@/features/team-chat/components/chat-room-list";
import { NewDmSheet } from "@/features/team-chat/components/new-dm-sheet";
import { getStoreCastsAction } from "@/features/team-chat/actions";
import {
  mockChatMessages,
  mockChatRooms,
} from "@/features/team-chat/lib/mock-chat-data";
import { loadChatRoomsForCast } from "@/features/team-chat/lib/supabase-queries";
import { getCurrentCastId } from "@/lib/nightos/auth";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { ChatRoom } from "@/features/team-chat/types";

export const dynamic = "force-dynamic";

export default async function ChatListPage() {
  const castId = await getCurrentCastId();

  const [rooms, storeCasts] = await Promise.all([
    resolveRooms(castId),
    getStoreCastsAction(),
  ]);

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between px-5 pt-10 pb-3">
        <div>
          <div className="text-label-xs tracking-luxe text-wine-deep mb-1.5">
            NIGHTOS
          </div>
          <h1 className="font-serif text-[28px] leading-[1.2] font-medium tracking-[0.02em] text-ink">
            チャット
          </h1>
        </div>
        <NewDmSheet storeCasts={storeCasts} />
      </div>
      <ChatRoomList rooms={rooms} currentCastId={castId} />
    </div>
  );
}

async function resolveRooms(castId: string): Promise<ChatRoom[]> {
  if (
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    try {
      const supabase = createServerSupabaseClient();
      const fromDb = await loadChatRoomsForCast(supabase, castId);
      if (fromDb && fromDb.length > 0) return fromDb;
    } catch {
      // fall through to mock
    }
  }
  return mockChatRooms
    .filter((r) => r.member_ids.includes(castId))
    .map((r) => attachLastMockMessage(r));
}

/** Re-compute last_message from the (mock) messages so the preview stays fresh. */
function attachLastMockMessage(room: ChatRoom): ChatRoom {
  const roomMsgs = mockChatMessages
    .filter((m) => m.room_id === room.id)
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );
  const last = roomMsgs[0];
  if (!last) return room;
  return {
    ...room,
    last_message: {
      content: last.deleted_at ? "(削除されたメッセージ)" : last.content,
      sender_name: last.sender_name,
      sent_at: last.created_at,
    },
  };
}
