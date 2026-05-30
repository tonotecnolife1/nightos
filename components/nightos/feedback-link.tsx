"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { MessageSquare } from "lucide-react";

const CHAT_PATTERNS = [
  /^\/cast\/ruri-mama/,
  /^\/cast\/chat/,
  /^\/mama\/ruri-mama/,
  /^\/mama\/chat/,
];

/**
 * Floating feedback button that opens a simple text input.
 * Stores feedback to Supabase (if configured) or logs to console.
 */
export function FeedbackLink() {
  const pathname = usePathname() ?? "";
  const isChat = CHAT_PATTERNS.some((re) => re.test(pathname));
  const side = isChat ? "left-4" : "right-4";

  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);

  const handleSubmit = async () => {
    if (!text.trim()) return;
    setSending(true);
    try {
      await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: text.trim(),
          page: window.location.pathname,
          timestamp: new Date().toISOString(),
        }),
      });
      setSent(true);
      setText("");
      setTimeout(() => {
        setOpen(false);
        setSent(false);
      }, 2000);
    } catch {
      // best-effort
    } finally {
      setSending(false);
    }
  };

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`fixed bottom-20 ${side} z-50 w-10 h-10 rounded-full bg-gold-deep text-pearl-light-light flex items-center justify-center shadow-lg active:scale-95 transition-transform`}
        aria-label="フィードバック"
      >
        <MessageSquare size={18} />
      </button>
    );
  }

  return (
    <div className={`fixed bottom-20 ${side} z-50 w-72 bg-white border border-pearl-soft rounded-card shadow-xl p-3 space-y-2 animate-fade-in`}>
      <div className="flex items-center justify-between">
        <span className="text-body-sm font-semibold text-ink">
          フィードバック
        </span>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="text-ink-muted text-[14px]"
        >
          ✕
        </button>
      </div>

      {sent ? (
        <p className="text-body-sm text-success py-2">
          送信しました。ありがとうございます！
        </p>
      ) : (
        <>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="使いづらい点、改善アイデア、バグなど..."
            rows={3}
            maxLength={1000}
            className="w-full px-2 py-1.5 rounded-btn border border-pearl-soft bg-pearl-soft text-body-sm text-ink placeholder:text-ink-muted resize-none focus:outline-none focus:border-gold/40"
          />
          <button
            type="button"
            onClick={handleSubmit}
            disabled={sending || !text.trim()}
            className="w-full py-1.5 rounded-btn bg-gold-deep text-pearl-light-light text-body-sm font-medium disabled:opacity-50"
          >
            {sending ? "送信中..." : "送信"}
          </button>
        </>
      )}
    </div>
  );
}
