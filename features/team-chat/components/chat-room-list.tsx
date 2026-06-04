"use client";

import Link from "next/link";
import { type ReactNode, useEffect, useMemo, useRef, useState } from "react";
import {
  BookOpen,
  Bookmark,
  Hash,
  type LucideIcon,
  MessageCircle,
  MoreHorizontal,
  Pencil,
  Pin,
  PinOff,
  ScanLine,
  Search,
  Users,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { EmptyState } from "@/components/nightos/empty-state";
import { getRoomName, setRoomName } from "@/lib/nightos/chat-room-name-store";
import {
  getPinnedRoomIds,
  subscribePinnedRooms,
  toggleRoomPin,
} from "@/lib/nightos/chat-pinned-rooms-store";
import { GroupNameModal } from "./group-name-modal";
import type { ChatRoom } from "../types";
import { PinnedList } from "./pinned-list";
import { LearningsView } from "./learnings-view";
import { FriendsTab } from "./friends-tab";
import { deriveChatFriends } from "../lib/chat-friends";
import {
  ContactExchangeSheet,
  type ExchangeTab,
} from "./contact-exchange-sheet";
import type { ContactPayload } from "@/features/qr-contact/lib/contact-payload";

interface Props {
  rooms: ChatRoom[];
  currentCastId: string;
  /** 「友達」タブ内の連絡先交換（マイQR）用の自分のペイロード。 */
  myPayload: ContactPayload;
  /**
   * 新規チャット作成ボタン (NewDmSheet)。検索バーの横に並べる。
   * ボトムシートは position:fixed なので、backdrop-filter を持つヘッダーの
   * 内側に置くと fixed の基準がずれてシートが画面外に出る。検索バー横
   * (filter 祖先なし) に置くことでビューポート基準に保つ。
   */
  newChatButton?: ReactNode;
}

type FilterTab = "all" | "channels" | "dm" | "friends" | "pinned" | "learnings";

/** トークの絞り込み（すべて / グループ / 個別連絡）。テキストだけのプレーンなピル。 */
const ROOM_TABS: { id: FilterTab; label: string }[] = [
  { id: "all", label: "すべて" },
  { id: "channels", label: "グループ" },
  { id: "dm", label: "個別連絡" },
];

type CollectionTab = {
  id: "friends" | "pinned" | "learnings";
  label: string;
  Icon: LucideIcon;
};

/**
 * 連絡先セクション。「友達」は LINE の友だちタブ相当（チャットページ内の
 * 友達一覧）で、人とのつながりを表す。トーク絞り込み・保存/学びのどちらとも
 * 別概念なので独立したセクションとして hairline で区切る。
 */
const CONTACT_TABS: CollectionTab[] = [
  { id: "friends", label: "友達", Icon: Users },
];

/**
 * 「集めたもの」セクション。メッセージから保存したもの（保存）と、そこから
 * さくらママが整理した学び（学び）。連絡先（人）とは別概念。
 */
const COLLECTION_TABS: CollectionTab[] = [
  { id: "pinned", label: "保存", Icon: Bookmark },
  { id: "learnings", label: "学び", Icon: BookOpen },
];

/** Tabs that show people / collections (friends / pins / learnings) rather than rooms. */
function isCollectionTab(
  tab: FilterTab,
): tab is "friends" | "pinned" | "learnings" {
  return tab === "pinned" || tab === "learnings" || tab === "friends";
}

/** Channel name, or (for DMs/groups) the joined other-member names. */
function baseRoomName(room: ChatRoom, currentCastId: string): string {
  if (room.type === "channel") return room.name ?? "";
  return room.member_names
    .filter((_, i) => room.member_ids[i] !== currentCastId)
    .join(", ");
}

export function ChatRoomList({
  rooms,
  currentCastId,
  myPayload,
  newChatButton,
}: Props) {
  const [tab, setTab] = useState<FilterTab>("all");
  const [query, setQuery] = useState("");
  // ユーザーがつけたグループ名（localStorage）。一覧でも編集・反映する。
  const [overrides, setOverrides] = useState<Record<string, string>>({});
  const [editing, setEditing] = useState<ChatRoom | null>(null);
  // ピン留めしたトークの id（新しい順）。上部に固定表示する。
  const [pinnedOrder, setPinnedOrder] = useState<string[]>([]);
  // 連絡先交換シートの初期タブ。null のとき閉じている。
  // 検索バーの読み取りから "scan"、友達タブから "my-qr" で開く。
  const [exchangeTab, setExchangeTab] = useState<ExchangeTab | null>(null);

  useEffect(() => {
    const map: Record<string, string> = {};
    for (const r of rooms) {
      const n = getRoomName(r.id);
      if (n) map[r.id] = n;
    }
    setOverrides(map);
  }, [rooms]);

  // ピン留め状態を購読（同タブ CustomEvent + タブ間 storage）。
  useEffect(() => {
    const refresh = () => setPinnedOrder(getPinnedRoomIds());
    refresh();
    return subscribePinnedRooms(refresh);
  }, []);

  const pinnedSet = new Set(pinnedOrder);
  const togglePin = (room: ChatRoom) => {
    toggleRoomPin(room.id);
    // 購読側の refresh が state を更新するが、即時反映のため先に同期。
    setPinnedOrder(getPinnedRoomIds());
  };

  const nameOf = (room: ChatRoom) =>
    overrides[room.id] || baseRoomName(room, currentCastId);

  const commitName = (room: ChatRoom, name: string) => {
    const saved = setRoomName(room.id, name);
    setOverrides((prev) => {
      const next = { ...prev };
      if (saved) next[room.id] = saved;
      else delete next[room.id];
      return next;
    });
    setEditing(null);
  };

  // ピン留めしたトークを最上部へ（ピンした新しい順）、残りは更新時刻の新しい順。
  const pinRank = (id: string) => {
    const i = pinnedOrder.indexOf(id);
    return i === -1 ? Infinity : i;
  };
  const sorted = [...rooms].sort((a, b) => {
    const ra = pinRank(a.id);
    const rb = pinRank(b.id);
    if (ra !== rb) return ra - rb;
    const aTime = a.last_message?.sent_at ?? a.created_at;
    const bTime = b.last_message?.sent_at ?? b.created_at;
    return new Date(bTime).getTime() - new Date(aTime).getTime();
  });

  const tabFiltered =
    tab === "all"
      ? sorted
      : tab === "channels"
        ? sorted.filter((r) => r.type === "channel")
        : sorted.filter((r) => r.type === "dm");

  const q = query.trim().toLowerCase();
  const filtered = q
    ? tabFiltered.filter((r) => {
        const otherNames = r.member_names
          .filter((_, i) => r.member_ids[i] !== currentCastId)
          .join(" ");
        const haystack = [
          r.name ?? "",
          overrides[r.id] ?? "",
          otherNames,
          r.last_message?.content ?? "",
          r.last_message?.sender_name ?? "",
        ]
          .join(" ")
          .toLowerCase();
        return haystack.includes(q);
      })
    : tabFiltered;

  // チャットで会話できる相手＝友達。DM/指導/グループの同席者を抽出して、
  // QR 交換した連絡先と合流させる（チャットできるのに友達にいない齟齬を防ぐ）。
  const chatFriends = useMemo(
    () => deriveChatFriends(rooms, currentCastId),
    [rooms, currentCastId],
  );

  const collection = isCollectionTab(tab);

  return (
    <div>
      {/* Search bar — room tabs only。新規チャット作成ボタンを右隣に並べる。 */}
      {!collection && (
        <div className="px-5 pt-3 flex items-center gap-2">
          <label className="flex flex-1 min-w-0 items-center gap-2 rounded-2xl border border-ink/[0.08] bg-pearl-light px-3 py-2 shadow-soft focus-within:border-wine-deep transition">
            <Search size={14} className="text-ink-mute shrink-0" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="トーク・相手を検索..."
              className="flex-1 bg-transparent text-body-sm text-ink placeholder:text-ink-mute focus:outline-none"
              style={{ fontSize: "16px" }}
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="text-ink-mute shrink-0"
                aria-label="検索をクリア"
              >
                <X size={14} />
              </button>
            )}
            {/* LINE のトーク検索と同じく、右端に QR 読み取り導線を置く */}
            <span
              className="mx-0.5 h-4 w-px shrink-0 self-center bg-line-strong"
              aria-hidden
            />
            <button
              type="button"
              onClick={() => setExchangeTab("scan")}
              className="shrink-0 text-ink-mute hover:text-wine-deep transition-colors"
              aria-label="QRコードを読み取る"
              title="QRコードを読み取る"
            >
              <ScanLine size={17} />
            </button>
          </label>
          {newChatButton}
        </div>
      )}

      {/* Filter tabs — トークの絞り込みと「集めたもの」を hairline で区切る */}
      <div className="flex items-center gap-1 px-5 py-3 border-b border-ink/[0.08] overflow-x-auto">
        {ROOM_TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={cn(
              "px-3 py-1.5 rounded-pill text-label-sm font-medium transition-colors whitespace-nowrap tracking-[0.04em]",
              tab === t.id
                ? "bg-champagne-soft/60 text-wine-deep border border-gold/30"
                : "text-ink-mute hover:text-ink-soft border border-transparent",
            )}
          >
            {t.label}
          </button>
        ))}

        {/* champagne hairline — ここから先はトークではなく「連絡先（人）」 */}
        <span
          className="mx-1.5 h-5 w-px shrink-0 self-center bg-gradient-to-b from-transparent via-gold/40 to-transparent"
          aria-hidden
        />

        {CONTACT_TABS.map((t) => (
          <CollectionTabButton
            key={t.id}
            tab={t}
            active={tab === t.id}
            onClick={() => setTab(t.id)}
          />
        ))}

        {/* champagne hairline — ここから先は「集めたもの（保存 / 学び）」 */}
        <span
          className="mx-1.5 h-5 w-px shrink-0 self-center bg-gradient-to-b from-transparent via-gold/40 to-transparent"
          aria-hidden
        />

        {COLLECTION_TABS.map((t) => (
          <CollectionTabButton
            key={t.id}
            tab={t}
            active={tab === t.id}
            onClick={() => setTab(t.id)}
          />
        ))}
      </div>

      {/* Collection tabs */}
      {tab === "friends" && (
        <FriendsTab
          onExchange={() => setExchangeTab("my-qr")}
          chatFriends={chatFriends}
        />
      )}
      {tab === "pinned" && <PinnedList />}
      {tab === "learnings" && <LearningsView />}

      {/* Room list */}
      {!collection && (
        <>
          <div className="divide-y divide-ink/[0.06]">
            {filtered.map((room) => (
              <RoomRow
                key={room.id}
                room={room}
                displayName={nameOf(room)}
                canRename={room.type !== "coaching"}
                isPinned={pinnedSet.has(room.id)}
                onEdit={() => setEditing(room)}
                onTogglePin={() => togglePin(room)}
              />
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="p-5">
              <EmptyState
                icon={<MessageCircle size={22} />}
                title={
                  q ? "一致するトークはありません" : "まだメッセージがありません"
                }
                description={
                  q
                    ? "別のキーワードをお試しください。"
                    : "みんなとのやり取りや、@さくらママ(AI) への相談を始めるとここに表示されます。"
                }
                tone="amethyst"
              />
            </div>
          )}
        </>
      )}

      {editing && (
        <GroupNameModal
          baseName={baseRoomName(editing, currentCastId)}
          initialName={overrides[editing.id] ?? ""}
          onClose={() => setEditing(null)}
          onSubmit={(name) => commitName(editing, name)}
        />
      )}

      {exchangeTab && (
        <ContactExchangeSheet
          myPayload={myPayload}
          initialTab={exchangeTab}
          onClose={() => setExchangeTab(null)}
        />
      )}
    </div>
  );
}

/** 連絡先 / 集めたもののピル。champagne の地で、トーク絞り込みと視覚的に区別する。 */
function CollectionTabButton({
  tab,
  active,
  onClick,
}: {
  tab: CollectionTab;
  active: boolean;
  onClick: () => void;
}) {
  const { id, label, Icon } = tab;
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-pill text-label-sm font-medium transition-colors whitespace-nowrap tracking-[0.04em]",
        active
          ? id === "learnings"
            ? "bg-success/15 text-success border border-success/30"
            : "bg-champagne-soft/70 text-wine-deep border border-gold/40"
          : "bg-champagne-soft/25 text-gold-deep border border-gold/15 hover:bg-champagne-soft/45 hover:text-wine-deep",
      )}
    >
      <Icon size={13} className="shrink-0" />
      {label}
    </button>
  );
}

function RoomRow({
  room,
  displayName,
  canRename,
  isPinned,
  onEdit,
  onTogglePin,
}: {
  room: ChatRoom;
  displayName: string;
  canRename: boolean;
  isPinned: boolean;
  onEdit: () => void;
  onTogglePin: () => void;
}) {
  const memberCount = room.member_ids.length;
  // メニューを開いている行は、隣接する行より前面に出す（半透明化・クリック不能の回避）。
  const [menuOpen, setMenuOpen] = useState(false);

  const lastMsg = room.last_message;
  const timeStr = lastMsg
    ? formatRelativeTime(lastMsg.sent_at)
    : "";

  return (
    <div
      className={cn(
        "relative",
        menuOpen && "z-40",
        isPinned && "bg-champagne-soft/25",
      )}
    >
      <Link
        href={`/cast/chat/${room.id}`}
        className="flex items-center gap-3 px-5 py-3.5 pr-14 hover:bg-pearl-soft/50 active:bg-pearl-soft transition-colors"
      >
      {/* Avatar / icon */}
      <div
        className={cn(
          "w-12 h-12 rounded-full flex items-center justify-center shrink-0 border",
          room.type === "channel"
            ? "border-gold/30 text-wine-deep"
            : room.type === "coaching"
            ? "bg-success/15 border-success/25 text-success"
            : "border-gold/35 text-ink",
        )}
        style={
          room.type !== "coaching"
            ? { background: "var(--champagne-metallic)", boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.6)" }
            : undefined
        }
      >
        {room.type === "channel" ? (
          <Hash size={20} />
        ) : room.type === "coaching" ? (
          <BookOpen size={20} />
        ) : memberCount > 2 ? (
          <Users size={20} />
        ) : (
          <div className="font-serif text-[18px] leading-none font-medium tracking-[0.02em] text-ink">
            {displayName.charAt(0)}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline justify-between">
          <div className="flex items-center gap-1.5 min-w-0">
            {isPinned && (
              <Pin
                size={12}
                className="shrink-0 text-gold-deep -rotate-45"
                aria-label="ピン留め中"
              />
            )}
            <span className="font-serif text-[15px] leading-[1.2] font-medium tracking-[0.01em] text-ink truncate">
              {displayName}
            </span>
          </div>
          {timeStr && (
            <span className="text-label-sm text-ink-mute shrink-0 ml-2 font-display tracking-[0.04em]">
              {timeStr}
            </span>
          )}
        </div>
        {lastMsg && (
          <p className="text-body-sm text-ink-soft truncate mt-0.5">
            {lastMsg.sender_name}: {lastMsg.content}
          </p>
        )}
      </div>
      </Link>

      <RoomRowMenu
        open={menuOpen}
        onOpenChange={setMenuOpen}
        canRename={canRename}
        isPinned={isPinned}
        onEdit={onEdit}
        onTogglePin={onTogglePin}
      />
    </div>
  );
}

/** 行右端の「···」メニュー。グループ名の編集 / ピン留めの選択肢を出す。 */
function RoomRowMenu({
  open,
  onOpenChange,
  canRename,
  isPinned,
  onEdit,
  onTogglePin,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  canRename: boolean;
  isPinned: boolean;
  onEdit: () => void;
  onTogglePin: () => void;
}) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onOpenChange(false);
    };
    const onPointer = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) onOpenChange(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer);
    };
  }, [open, onOpenChange]);

  return (
    <div
      ref={rootRef}
      className="absolute right-3 top-1/2 -translate-y-1/2"
    >
      <button
        type="button"
        onClick={() => onOpenChange(!open)}
        aria-label="トークの操作"
        aria-expanded={open}
        title="トークの操作"
        className={cn(
          "w-8 h-8 rounded-full flex items-center justify-center text-ink-mute hover:text-wine-deep hover:bg-pearl-soft transition-colors",
          open && "bg-wine-deep/10 text-wine-deep",
        )}
      >
        <MoreHorizontal size={18} />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full mt-1.5 z-30 w-44 origin-top-right rounded-2xl border border-ink/[0.08] bg-pearl shadow-warm p-1 animate-fade-in"
        >
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              onOpenChange(false);
              onTogglePin();
            }}
            className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-body-sm text-ink hover:bg-pearl-soft transition-colors"
          >
            {isPinned ? (
              <PinOff size={15} className="shrink-0 text-ink-soft" />
            ) : (
              <Pin size={15} className="shrink-0 text-gold-deep -rotate-45" />
            )}
            {isPinned ? "ピン留めを解除" : "ピン留め"}
          </button>
          {canRename && (
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                onOpenChange(false);
                onEdit();
              }}
              className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-body-sm text-ink hover:bg-pearl-soft transition-colors"
            >
              <Pencil size={15} className="shrink-0 text-ink-soft" />
              グループ名を編集
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function formatRelativeTime(isoStr: string): string {
  const d = new Date(isoStr);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / (24 * 60 * 60 * 1000));

  if (diffDays === 0) {
    return `${d.getHours()}:${String(d.getMinutes()).padStart(2, "0")}`;
  }
  if (diffDays === 1) return "昨日";
  if (diffDays < 7) return `${diffDays}日前`;
  return `${d.getMonth() + 1}/${d.getDate()}`;
}
