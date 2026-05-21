"use client";

import { useEffect, useState } from "react";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/nightos/page-header";
import { MessageBubble } from "@/features/sakura-mama/components/message-bubble";
import {
  loadSessions,
  type ChatSession,
} from "@/features/sakura-mama/lib/chat-session-store";

export default function SessionViewPage({
  params,
}: {
  params: { id: string };
}) {
  const [session, setSession] = useState<ChatSession | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const sessions = loadSessions();
    const found = sessions.find((s) => s.id === params.id);
    setSession(found ?? null);
    setLoaded(true);
  }, [params.id]);

  if (loaded && !session) {
    return (
      <div className="animate-fade-in">
        <PageHeader title="履歴が見つかりません" showBack />
        <div className="px-5 pt-8 text-center text-ink-secondary">
          この相談履歴は削除されたか、存在しません。
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="px-5 pt-16 text-center text-ink-muted animate-pulse">
        読み込み中…
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <PageHeader
        title={session.customerName ? `${session.customerName}さま` : "顧客指定なし"}
        subtitle={new Date(session.createdAt).toLocaleDateString("ja-JP")}
        showBack
      />
      <div className="px-4 pt-4 pb-6 space-y-3">
        {session.messages.map((m, i) => (
          <MessageBubble key={i} message={m} />
        ))}
      </div>
    </div>
  );
}
