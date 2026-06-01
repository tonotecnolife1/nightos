"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  BookOpen,
  Hash,
  MessageCircle,
  MoreHorizontal,
  Pencil,
  Pin,
  PinOff,
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

interface Props {
  rooms: ChatRoom[];
  currentCastId: string;
}

type FilterTab = "all" | "channels" | "dm" | "pinned" | "learnings";

const TAB_LABELS: Record<FilterTab, string> = {
  all: "すべて",
  channels: "グループ",
  dm: "個別連絡",
  pinned: "🔖 キープ",
  learnings: "📚 学び",
};

/** Tabs that show running collections (pins / learnings) rather than rooms. */
function isCollectionTab(tab: FilterTab): tab is "pinned" | "learnings" {
  return tab === "pinned" || tab === "learnings";
}

/** Channel name, or (for DMs/groups) the joined other-member names. */
function baseRoomName(room: ChatRoom, currentCastId: string): string {
  if (room.type === "channel") return room.name ?? "";
  return room.member_names
    .filter((_, i) => room.member_ids[i] !== currentCastId)
    .join(", ");
}

export function ChatRoomList({ rooms, currentCastId }: Props) {
  const [tab, setTab] = useState<FilterTab>("all");
  const [query, setQuery] = useState("");
  // ユーザーがつけたグループ名（localStorage）。一覧でも編集・反映する。
  const [overrides, setOverrides] = useState<Record<string, string>>({});
  const [editing, setEditing] = useState<ChatRoom | null>(null);
  // ピン留めしたトークの id（新しい順）。上部に固定表示する。
  const [pinnedOrder, setPinnedOrder] = useState<string[]>([]);

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

  const collection = isCollectionTab(tab);

  return (
    <div>
      {/* Search bar — room tabs only */}
      {!collection && (
        <div className="px-5 pt-3">
          <label className="flex items-center gap-2 rounded-2xl border border-ink/[0.08] bg-pearl-light px-3 py-2 shadow-soft focus-within:border-wine-deep transition">
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
          </label>
        </div>
      )}

      {/* Filter tabs */}
      <div className="flex gap-1 px-5 py-3 border-b border-ink/[0.08] overflow-x-auto">
        {(["all", "channels", "dm", "pinned", "learnings"] as FilterTab[]).map(
          (t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={cn(
                "px-3 py-1.5 rounded-pill text-label-sm font-medium transition-colors whitespace-nowrap tracking-[0.04em]",
                tab === t
                  ? t === "learnings"
                    ? "bg-success/15 text-success border border-success/25"
                    : "bg-champagne-soft/60 text-wine-deep border border-gold/30"
                  : "text-ink-mute hover:text-ink-soft border border-transparent",
              )}
            >
              {TAB_LABELS[t]}
            </button>
          ),
        )}
      </div>

      {/* Collection tabs */}
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
    </div>
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

  const lastMsg = room.last_message;
  const timeStr = lastMsg
    ? formatRelativeTime(lastMsg.sent_at)
    : "";

  return (
    <div className={cn("relative", isPinned && "bg-champagne-soft/25")}>
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
  canRename,
  isPinned,
  onEdit,
  onTogglePin,
}: {
  canRename: boolean;
  isPinned: boolean;
  onEdit: () => void;
  onTogglePin: () => void;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    const onPointer = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer);
    };
  }, [open]);

  return (
    <div
      ref={rootRef}
      className="absolute right-3 top-1/2 -translate-y-1/2"
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
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
              setOpen(false);
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
                setOpen(false);
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
