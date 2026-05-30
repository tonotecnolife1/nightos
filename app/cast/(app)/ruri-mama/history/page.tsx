"use client";

import { Clock, MessageCircle, Search, Trash2, User } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { PageHeader } from "@/components/nightos/page-header";
import { Card } from "@/components/nightos/card";
import { EmptyState } from "@/components/nightos/empty-state";
import { cn } from "@/lib/utils";
import {
  deleteSession,
  groupByCustomer,
  loadSessions,
  type ChatSession,
} from "@/features/ruri-mama/lib/chat-session-store";

export default function ChatHistoryPage() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [query, setQuery] = useState("");
  const [expandedCustomer, setExpandedCustomer] = useState<string | null>(null);

  useEffect(() => {
    setSessions(loadSessions());
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

  const groups = useMemo(() => groupByCustomer(filtered), [filtered]);

  const handleDelete = (id: string) => {
    deleteSession(id);
    setSessions(loadSessions());
  };

  return (
    <div className="animate-fade-in">
      <PageHeader title="相談履歴" subtitle="過去のさくらママとのやりとり" showBack />
      <div className="px-5 pt-3 pb-6 space-y-3">
        {/* Search */}
        <div className="relative">
          <Search
            size={13}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-mute"
          />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="顧客名・キーワードで検索"
            style={{ fontSize: "13px" }}
            className="w-full h-10 pl-8 pr-3 rounded-full bg-pearl-warm border border-pearl-soft text-ink outline-none focus:border-gold/30 placeholder:text-ink-mute"
          />
        </div>

        <div className="text-[11px] text-ink-mute">
          {filtered.length}件の相談履歴
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            icon={<MessageCircle size={22} />}
            title={query ? "該当する履歴が見つかりません" : "まだ相談履歴がありません"}
            description={
              query
                ? "別のキーワードで試してみてくださいね"
                : "さくらママに一度相談するとここに記録されます。いつでも振り返れます。"
            }
            tone="amethyst"
            action={
              !query && (
                <Link
                  href="/cast/ruri-mama"
                  className="inline-block h-10 px-5 rounded-btn bg-wine-deep text-pearl-light text-label-md font-medium active:scale-[0.98]"
                >
                  さくらママに相談する
                </Link>
              )
            }
          />
        ) : (
          groups.map((group) => {
            const groupKey = group.customerId ?? "__none__";
            const isExpanded = expandedCustomer === null || expandedCustomer === groupKey;
            return (
              <section key={groupKey}>
                <button
                  type="button"
                  onClick={() =>
                    setExpandedCustomer(
                      expandedCustomer === groupKey ? null : groupKey,
                    )
                  }
                  className="w-full flex items-center gap-2 py-2 text-left"
                >
                  <div className="w-7 h-7 rounded-full bg-champagne-soft/60 border border-gold/30 flex items-center justify-center shrink-0">
                    <User size={13} className="text-gold-deep" />
                  </div>
                  <span className="text-[12px] font-semibold text-ink flex-1">
                    {group.customerName ? `${group.customerName}さま` : "顧客指定なし"}
                  </span>
                  <span className="text-[10px] text-ink-mute">
                    {group.sessions.length}件
                  </span>
                </button>

                {isExpanded && (
                  <div className="space-y-1.5 ml-9 mb-3">
                    {group.sessions.map((s) => (
                      <SessionRow
                        key={s.id}
                        session={s}
                        onDelete={() => handleDelete(s.id)}
                      />
                    ))}
                  </div>
                )}
              </section>
            );
          })
        )}
      </div>
    </div>
  );
}

function SessionRow({
  session,
  onDelete,
}: {
  session: ChatSession;
  onDelete: () => void;
}) {
  const date = new Date(session.updatedAt);
  const dateLabel = `${date.getMonth() + 1}/${date.getDate()} ${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
  const msgCount = session.messages.filter((m) => m.role === "user").length;
  // Get last assistant message as preview
  const lastAssistant = [...session.messages]
    .reverse()
    .find((m) => m.role === "assistant");
  const preview = lastAssistant?.content.slice(0, 60) ?? "";

  return (
    <Link
      href={`/cast/ruri-mama/history/${session.id}`}
      className="block"
    >
      <Card className="p-3 active:scale-[0.99] transition-transform">
        <div className="flex items-start gap-2">
          <div className="flex-1 min-w-0">
            <div className="text-[12px] font-semibold text-ink truncate">
              {session.title}
            </div>
            {preview && (
              <div className="text-[10px] text-ink-soft mt-0.5 truncate">
                {preview}…
              </div>
            )}
            <div className="flex items-center gap-2 mt-1 text-[10px] text-ink-mute">
              <span className="flex items-center gap-0.5">
                <Clock size={9} />
                {dateLabel}
              </span>
              <span>{msgCount}往復</span>
            </div>
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (confirm("この履歴を削除しますか？")) onDelete();
            }}
            className="w-6 h-6 rounded-full text-ink-mute hover:text-wine-deep flex items-center justify-center shrink-0"
          >
            <Trash2 size={11} />
          </button>
        </div>
      </Card>
    </Link>
  );
}
