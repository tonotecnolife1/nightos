import { describe, it, expect } from "vitest";
import { deriveChatFriends } from "@/features/team-chat/lib/chat-friends";
import type { ChatRoom } from "@/features/team-chat/types";

function room(partial: Partial<ChatRoom>): ChatRoom {
  return {
    id: "r",
    store_id: "store1",
    type: "dm",
    name: null,
    member_ids: [],
    member_names: [],
    visible_to_seniors: false,
    created_at: "2026-01-01T00:00:00+09:00",
    ...partial,
  };
}

describe("deriveChatFriends", () => {
  const me = "cast1";

  it("チャット相手を友達として抽出する（自分は除く）", () => {
    const rooms = [
      room({
        id: "dm1",
        member_ids: ["cast1", "cast_oneesan2"],
        member_names: ["あかり", "ゆき（姉さん）"],
      }),
    ];
    expect(deriveChatFriends(rooms, me)).toEqual([
      { id: "cast_oneesan2", name: "ゆき（姉さん）" },
    ]);
  });

  it("複数ルームに跨る相手を ID で重複排除する", () => {
    const rooms = [
      room({
        id: "dm1",
        member_ids: ["cast1", "cast_help2"],
        member_names: ["あかり", "あやな"],
      }),
      room({
        id: "channel1",
        type: "channel",
        name: "全体連絡",
        member_ids: ["cast1", "cast_help2", "cast_oneesan2"],
        member_names: ["あかり", "あやな", "ゆき（姉さん）"],
      }),
    ];
    const friends = deriveChatFriends(rooms, me);
    expect(friends.map((f) => f.id)).toEqual(["cast_help2", "cast_oneesan2"]);
  });

  it("AI（さくらママ）は友達に含めない", () => {
    const rooms = [
      room({
        id: "dm1",
        member_ids: ["cast1", "sakura_mama", "cast_oneesan2"],
        member_names: ["あかり", "さくらママ", "ゆき（姉さん）"],
      }),
    ];
    expect(deriveChatFriends(rooms, me)).toEqual([
      { id: "cast_oneesan2", name: "ゆき（姉さん）" },
    ]);
  });

  it("名前が空のメンバーはスキップする", () => {
    const rooms = [
      room({
        id: "dm1",
        member_ids: ["cast1", "ghost"],
        member_names: ["あかり", "  "],
      }),
    ];
    expect(deriveChatFriends(rooms, me)).toEqual([]);
  });
});
