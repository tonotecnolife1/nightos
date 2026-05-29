"use client";

import Link from "next/link";
import { useState } from "react";
import { BookOpen, Hash, MessageCircle, Search, Users, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { EmptyState } from "@/components/nightos/empty-state";
import type { ChatRoom } from "../types";

interface Props {
  rooms: ChatRoom[];
  currentCastId: string;
}

type FilterTab = "all" | "channels" | "dm" | "coaching";

export function ChatRoomList({ rooms, currentCastId }: Props) {
  const [tab, setTab] = useState<FilterTab>("all");
  const [query, setQuery] = useState("");

  const sorted = [...rooms].sort((a, b) => {
    const aTime = a.last_message?.sent_at ?? a.created_at;
    const bTime = b.last_message?.sent_at ?? b.created_at;
    return new Date(bTime).getTime() - new Date(aTime).getTime();
  });

  const tabFiltered =
    tab === "all"
      ? sorted
      : tab === "channels"
        ? sorted.filter((r) => r.type === "channel")
        : tab === "coaching"
          ? sorted.filter((r) => r.type === "coaching")
          : sorted.filter((r) => r.type === "dm");

  const q = query.trim().toLowerCase();
  const filtered = q
    ? tabFiltered.filter((r) => {
        const otherNames = r.member_names
          .filter((_, i) => r.member_ids[i] !== currentCastId)
          .join(" ");
        const haystack = [
          r.name ?? "",
          otherNames,
          r.last_message?.content ?? "",
          r.last_message?.sender_name ?? "",
        ]
          .join(" ")
          .toLowerCase();
        return haystack.includes(q);
      })
    : tabFiltered;

  return (
    <div>
      {/* Search bar */}
      <div className="px-5 pt-3">
        <label className="flex items-center gap-2 rounded-2xl border border-ink/[0.08] bg-pearl-light px-3 py-2 shadow-soft focus-within:border-roseGold-deep transition">
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

      {/* Filter tabs */}
      <div className="flex gap-1 px-5 py-3 border-b border-ink/[0.08]">
        {(["all", "channels", "dm", "coaching"] as FilterTab[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={cn(
              "px-3 py-1.5 rounded-pill text-label-sm font-medium transition-colors whitespace-nowrap tracking-[0.04em]",
              tab === t
                ? t === "coaching"
                  ? "bg-success/15 text-success border border-success/25"
                  : "bg-roseGold-soft/60 text-roseGold-deep border border-roseGold/30"
                : "text-ink-mute hover:text-ink-soft border border-transparent",
            )}
          >
            {t === "all"
              ? "すべて"
              : t === "channels"
              ? "グループ"
              : t === "coaching"
              ? "📚 指導"
              : "個別連絡"}
          </button>
        ))}
      </div>

      {/* Room list */}
      <div className="divide-y divide-ink/[0.06]">
        {filtered.map((room) => (
          <RoomRow
            key={room.id}
            room={room}
            currentCastId={currentCastId}
          />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="p-5">
          <EmptyState
            icon={<MessageCircle size={22} />}
            title={q ? "一致するトークはありません" : "まだメッセージがありません"}
            description={
              q
                ? "別のキーワードをお試しください。"
                : "みんなとのやり取りや、@さくらママ(AI) への相談を始めるとここに表示されます。"
            }
            tone="amethyst"
          />
        </div>
      )}
    </div>
  );
}

function RoomRow({
  room,
  currentCastId,
}: {
  room: ChatRoom;
  currentCastId: string;
}) {
  const displayName =
    room.type === "channel"
      ? room.name!
      : room.member_names
          .filter(
            (_, i) => room.member_ids[i] !== currentCastId,
          )
          .join(", ");

  const memberCount = room.member_ids.length;

  const lastMsg = room.last_message;
  const timeStr = lastMsg
    ? formatRelativeTime(lastMsg.sent_at)
    : "";

  return (
    <Link
      href={`/cast/chat/${room.id}`}
      className="flex items-center gap-3 px-5 py-3.5 hover:bg-pearl-soft/50 active:bg-pearl-soft transition-colors"
    >
      {/* Avatar / icon */}
      <div
        className={cn(
          "w-12 h-12 rounded-full flex items-center justify-center shrink-0 border",
          room.type === "channel"
            ? "border-roseGold/30 text-roseGold-deep"
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
          <div className="flex items-center gap-1.5">
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
