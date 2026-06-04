import {
  SAKURA_MAMA_CHAT_NAME,
  SAKURA_MAMA_DISPLAY_NAME,
} from "@/lib/nightos/constants";
import type { ChatRoom } from "../types";

/**
 * チャットで会話できる相手（自分・AI を除くルームメンバー）。
 *
 * 「友達」タブは本来 QR 交換した連絡先だけを並べていたが、DM や指導ルーム、
 * グループに同席している相手＝チャット可能な相手は、交換していなくても
 * 「友達」に並んでいないと整合性が取れない（チャットできるのに友達一覧に
 * いない、という齟齬が起きる）。ここでルームから相手を抽出して、友達一覧に
 * 合流させる。
 */
export interface ChatFriend {
  id: string;
  name: string;
  role?: string;
}

/** ルームメンバーとして並んでも「友達」に出さない AI（さくらママ）の識別子。 */
const AI_MEMBER_IDS = new Set(["sakura_mama", "ruri_mama", "ruri-mama"]);
const AI_MEMBER_NAMES = new Set([
  SAKURA_MAMA_DISPLAY_NAME,
  SAKURA_MAMA_CHAT_NAME,
]);

function isAiMember(id: string, name: string): boolean {
  return AI_MEMBER_IDS.has(id) || AI_MEMBER_NAMES.has(name.trim());
}

/**
 * 参加しているルームから、チャット可能な相手を一意に抽出する。
 * 自分自身と AI（さくらママ）は除外し、名前の五十音順で返す。
 */
export function deriveChatFriends(
  rooms: ChatRoom[],
  currentCastId: string,
): ChatFriend[] {
  const byId = new Map<string, ChatFriend>();
  for (const room of rooms) {
    room.member_ids.forEach((id, i) => {
      if (id === currentCastId) return;
      const name = room.member_names[i]?.trim();
      if (!name) return;
      if (isAiMember(id, name)) return;
      if (byId.has(id)) return;
      byId.set(id, { id, name });
    });
  }
  return Array.from(byId.values()).sort((a, b) =>
    a.name.localeCompare(b.name, "ja"),
  );
}
