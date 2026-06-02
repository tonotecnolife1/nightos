import { ChatHeaderActions } from "@/features/team-chat/components/chat-header-actions";
import { ChatRoomList } from "@/features/team-chat/components/chat-room-list";
import { getStoreCastsAction } from "@/features/team-chat/actions";
import {
  mockChatMessages,
  mockChatRooms,
} from "@/features/team-chat/lib/mock-chat-data";
import { loadChatRoomsForCast } from "@/features/team-chat/lib/supabase-queries";
import { getCurrentCast } from "@/lib/nightos/auth";
import { CURRENT_CAST_ID } from "@/lib/nightos/constants";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { ContactPayload } from "@/features/qr-contact/lib/contact-payload";
import type { ChatRoom } from "@/features/team-chat/types";

export const dynamic = "force-dynamic";

export default async function ChatListPage() {
  const cast = await getCurrentCast();
  const castId = cast?.id ?? CURRENT_CAST_ID;

  const [rooms, storeCasts, storeName] = await Promise.all([
    resolveRooms(castId),
    getStoreCastsAction(),
    resolveStoreName(cast?.store_id),
  ]);

  // 連絡先交換（マイQR）用の自分のペイロード。
  const myPayload: ContactPayload = {
    v: 1,
    id: castId,
    name: cast?.name ?? "キャスト",
    role: "キャスト",
    ...(storeName ? { store: storeName } : {}),
  };

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
        <ChatHeaderActions storeCasts={storeCasts} myPayload={myPayload} />
      </div>
      <ChatRoomList rooms={rooms} currentCastId={castId} />
    </div>
  );
}

async function resolveStoreName(
  storeId: string | null | undefined,
): Promise<string | undefined> {
  if (!storeId) return undefined;
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    return undefined;
  }
  try {
    const supabase = createServerSupabaseClient();
    const { data } = await supabase
      .from("nightos_stores")
      .select("name")
      .eq("id", storeId)
      .maybeSingle();
    return (data?.name as string) ?? undefined;
  } catch {
    return undefined;
  }
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
