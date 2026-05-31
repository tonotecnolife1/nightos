"use client";

import {
  ArrowRight,
  Clock,
  MessageCircle,
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  Search,
  Trash2,
  User,
  X,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { MessageBubble } from "./message-bubble";
import {
  deleteSession,
  loadSessions,
  type ChatSession,
} from "../lib/chat-session-store";

function sortByRecent(sessions: ChatSession[]): ChatSession[] {
  return [...sessions].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  const mm = d.getMonth() + 1;
  const dd = d.getDate();
  const hh = String(d.getHours()).padStart(2, "0");
  const mi = String(d.getMinutes()).padStart(2, "0");
  return `${mm}/${dd} ${hh}:${mi}`;
}

function customerLabel(session: ChatSession): string {
  return session.customerName ? `${session.customerName}さま` : "お客様指定なし";
}

/**
 * ChatGPT / Claude 風の相談履歴ビュー。
 * 左側にセッション一覧のサイドバー（ドロワー）、右に選択中の会話を表示する。
 * サイドバーはトグルで表示 / 非表示を切り替えられる（mobile はオーバーレイ）。
 */
export function ChatHistoryView() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const all = sortByRecent(loadSessions());
    setSessions(all);
    setSelectedId(all[0]?.id ?? null);
    setLoaded(true);
  }, []);

  const filtered = useMemo(() => {
    if (!query.trim()) return sessions;
    const q = query.trim().toLowerCase();
    return sessions.filter(
      (s) =>
        s.title.toLowerCase().includes(q) ||
        s.customerName?.toLowerCase().includes(q) ||
        s.messages.some((m) => m.content.toLowerCase().includes(q)),
    );
  }, [sessions, query]);

  const selected = useMemo(
    () => sessions.find((s) => s.id === selectedId) ?? null,
    [sessions, selectedId],
  );

  const handleSelect = (id: string) => {
    setSelectedId(id);
    // mobile: ドロワーを閉じて会話を全画面で読めるようにする
    setSidebarOpen(false);
  };

  const handleDelete = (id: string) => {
    if (!confirm("この相談履歴を削除しますか？")) return;
    deleteSession(id);
    const all = sortByRecent(loadSessions());
    setSessions(all);
    if (selectedId === id) setSelectedId(all[0]?.id ?? null);
  };

  // 履歴が 1 件もない場合
  if (loaded && sessions.length === 0) {
    return (
      <div className="px-6 pt-16 flex flex-col items-center text-center gap-3">
        <div className="w-14 h-14 rounded-full bg-champagne-soft/60 border border-gold/30 flex items-center justify-center text-gold-deep">
          <MessageCircle size={24} />
        </div>
        <p className="text-[15px] font-semibold text-ink">
          まだ相談履歴がありません
        </p>
        <p className="text-[13px] text-ink-soft leading-relaxed max-w-[280px]">
          さくらママに一度相談すると、ここにセッションとして記録されます。いつでも振り返れます。
        </p>
        <Link
          href="/cast/ruri-mama"
          className="mt-2 inline-flex items-center gap-1.5 h-11 px-6 rounded-btn bg-wine-deep text-pearl-light text-[14px] font-medium active:scale-[0.98]"
        >
          さくらママに相談する
        </Link>
      </div>
    );
  }

  return (
    <div className="relative flex flex-col h-[calc(100dvh-92px)] overflow-hidden">
      {/* 上部バー: サイドバーの開閉トグル + 選択中の会話メタ */}
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-pearl-soft bg-pearl/95">
        <button
          type="button"
          onClick={() => setSidebarOpen((v) => !v)}
          aria-label={sidebarOpen ? "履歴一覧を隠す" : "履歴一覧を表示"}
          className="w-9 h-9 rounded-full flex items-center justify-center text-ink-soft hover:bg-pearl-warm active:scale-95 transition shrink-0"
        >
          {sidebarOpen ? (
            <PanelLeftClose size={19} />
          ) : (
            <PanelLeftOpen size={19} />
          )}
        </button>
        <div className="flex-1 min-w-0">
          {selected ? (
            <>
              <div className="text-[13px] font-semibold text-ink truncate">
                {customerLabel(selected)}
              </div>
              <div className="text-[11px] text-ink-mute truncate">
                {formatDate(selected.updatedAt)}
              </div>
            </>
          ) : (
            <div className="text-[13px] text-ink-mute">
              左の一覧から相談を選んでください
            </div>
          )}
        </div>
        {selected && (
          <Link
            href={
              selected.customerId
                ? `/cast/ruri-mama?customerId=${selected.customerId}`
                : "/cast/ruri-mama"
            }
            className="inline-flex items-center gap-1 h-8 px-3 rounded-pill bg-wine-deep text-pearl-light text-[11px] font-medium active:scale-95 shrink-0"
          >
            続けて相談
            <ArrowRight size={12} />
          </Link>
        )}
      </div>

      {/* 会話ペイン（選択中セッション） */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 pb-28">
        {selected ? (
          selected.messages.map((m, i) => <MessageBubble key={i} message={m} />)
        ) : (
          <div className="pt-20 text-center text-[13px] text-ink-mute">
            相談履歴を選ぶと、ここに会話が表示されます。
          </div>
        )}
      </div>

      {/* 背景（サイドバー表示中のオーバーレイ） */}
      {sidebarOpen && (
        <button
          type="button"
          aria-label="閉じる"
          onClick={() => setSidebarOpen(false)}
          className="absolute inset-0 z-30 bg-ink/25 backdrop-blur-[1px]"
        />
      )}

      {/* セッション一覧サイドバー（ドロワー） */}
      <aside
        className={cn(
          "absolute inset-y-0 left-0 z-40 w-[86%] max-w-[330px] flex flex-col",
          "bg-pearl border-r border-pearl-soft shadow-warm",
          "transition-transform duration-300 ease-out",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        {/* サイドバー ヘッダ */}
        <div className="flex items-center gap-2 px-3.5 pt-3.5 pb-2">
          <span className="flex-1 text-[13px] font-semibold tracking-luxe text-ink">
            相談履歴
          </span>
          <Link
            href="/cast/ruri-mama"
            aria-label="新しい相談"
            className="inline-flex items-center gap-1 h-8 px-2.5 rounded-pill bg-pearl-light border border-gold/30 text-gold-deep text-[11px] font-medium active:scale-95"
          >
            <Plus size={13} />
            新規
          </Link>
          <button
            type="button"
            aria-label="一覧を閉じる"
            onClick={() => setSidebarOpen(false)}
            className="w-8 h-8 rounded-full flex items-center justify-center text-ink-mute hover:bg-pearl-warm active:scale-95"
          >
            <X size={17} />
          </button>
        </div>

        {/* 検索 */}
        <div className="px-3.5 pb-2">
          <div className="relative">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-mute"
            />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="お客様名・キーワードで検索"
              style={{ fontSize: "13px" }}
              className="w-full h-10 pl-8 pr-3 rounded-full bg-pearl-warm border border-pearl-soft text-ink outline-none focus:border-gold/30 placeholder:text-ink-mute"
            />
          </div>
        </div>

        <div className="px-3.5 pb-1 text-[11px] text-ink-mute">
          {filtered.length}件の相談履歴
        </div>

        {/* セッション一覧 */}
        <div className="flex-1 overflow-y-auto px-3 pb-28 space-y-2">
          {filtered.length === 0 ? (
            <p className="px-2 pt-6 text-[12px] text-ink-mute text-center">
              該当する履歴が見つかりません。
              <br />
              別のキーワードで試してみてくださいね。
            </p>
          ) : (
            filtered.map((s) => (
              <SessionCard
                key={s.id}
                session={s}
                active={s.id === selectedId}
                onSelect={() => handleSelect(s.id)}
                onDelete={() => handleDelete(s.id)}
              />
            ))
          )}
        </div>
      </aside>
    </div>
  );
}

function SessionCard({
  session,
  active,
  onSelect,
  onDelete,
}: {
  session: ChatSession;
  active: boolean;
  onSelect: () => void;
  onDelete: () => void;
}) {
  const msgCount = session.messages.filter((m) => m.role === "user").length;
  const lastAssistant = [...session.messages]
    .reverse()
    .find((m) => m.role === "assistant");
  const preview = lastAssistant?.content.slice(0, 70) ?? "";

  return (
    <div
      className={cn(
        "group rounded-card border p-3.5 transition active:scale-[0.99]",
        active
          ? "bg-champagne-soft/50 border-gold/40 shadow-soft"
          : "bg-pearl-light border-pearl-soft hover:border-gold/30",
      )}
    >
      <button
        type="button"
        onClick={onSelect}
        className="w-full text-left"
      >
        <div className="flex items-center gap-1.5 mb-1">
          <span className="inline-flex items-center gap-1 max-w-full">
            <User size={11} className="text-gold-deep shrink-0" />
            <span className="text-[11px] font-medium text-gold-deep truncate">
              {customerLabel(session)}
            </span>
          </span>
        </div>
        <div className="text-[14px] font-semibold text-ink leading-snug line-clamp-2">
          {session.title}
        </div>
        {preview && (
          <div className="text-[12px] text-ink-soft mt-1 line-clamp-2 leading-relaxed">
            {preview}…
          </div>
        )}
        <div className="flex items-center gap-3 mt-2 text-[11px] text-ink-mute">
          <span className="flex items-center gap-1">
            <Clock size={11} />
            {formatDate(session.updatedAt)}
          </span>
          <span>{msgCount}往復</span>
        </div>
      </button>
      <div className="flex justify-end mt-1">
        <button
          type="button"
          onClick={onDelete}
          aria-label="この履歴を削除"
          className="w-7 h-7 rounded-full flex items-center justify-center text-ink-mute hover:text-wine-deep hover:bg-pearl-warm"
        >
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  );
}
