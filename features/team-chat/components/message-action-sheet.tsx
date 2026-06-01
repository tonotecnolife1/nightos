"use client";

import { useRef, useState } from "react";
import {
  Check,
  Copy,
  Pencil,
  Pin,
  Reply,
  TextCursorInput,
  Trash2,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { ChatMessage } from "../types";

interface ActionSheetProps {
  message: ChatMessage;
  isPinned?: boolean;
  canReply?: boolean;
  canEdit?: boolean;
  onReply: () => void;
  onCopyAll: () => void;
  onPartialCopy: () => void;
  onPin: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onClose: () => void;
}

/**
 * LINE風の長押しメニュー。吹き出しを長押し（PCは右クリック）で開き、
 * 返信・コピー・部分コピー・ピン留め・編集・取り消しを大きなタップ領域で出す。
 * 常時表示のアクション列を廃したので、スクロール中の誤タップが起きない。
 */
export function MessageActionSheet({
  message,
  isPinned,
  canReply,
  canEdit,
  onReply,
  onCopyAll,
  onPartialCopy,
  onPin,
  onEdit,
  onDelete,
  onClose,
}: ActionSheetProps) {
  const hasText = message.content.trim().length > 0;

  return (
    <div
      className="fixed inset-0 z-[70] flex items-end justify-center bg-ink/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-t-[24px] bg-pearl border-t border-gold/20 shadow-luxe px-3 pt-3 pb-safe animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto mb-2 h-1 w-10 rounded-full bg-ink/15" />

        {/* Message preview */}
        <div className="rounded-card border border-ink/[0.08] bg-pearl-light px-3 py-2 mx-1 mb-2">
          <p className="text-[11px] text-ink-mute mb-0.5">{message.sender_name}</p>
          <p className="text-body-sm text-ink line-clamp-2 whitespace-pre-wrap break-words">
            {message.content || "（画像）"}
          </p>
        </div>

        <div className="flex flex-col">
          {canReply && (
            <ActionRow icon={<Reply size={18} />} label="返信" onClick={onReply} />
          )}
          {hasText && (
            <ActionRow
              icon={<Copy size={18} />}
              label="全コピー"
              onClick={onCopyAll}
            />
          )}
          {hasText && (
            <ActionRow
              icon={<TextCursorInput size={18} />}
              label="部分コピー"
              sub="必要なところだけ選んでコピー"
              onClick={onPartialCopy}
            />
          )}
          <ActionRow
            icon={<Pin size={18} className={isPinned ? "text-gold-deep" : undefined} />}
            label={isPinned ? "ピン留めを編集" : "ピン留め"}
            onClick={onPin}
          />
          {canEdit && (
            <ActionRow
              icon={<Pencil size={18} />}
              label="編集"
              onClick={onEdit}
            />
          )}
          {canEdit && (
            <ActionRow
              icon={<Trash2 size={18} />}
              label="取り消し"
              destructive
              onClick={onDelete}
            />
          )}
        </div>

        <button
          type="button"
          onClick={onClose}
          className="mt-2 mb-1 w-full rounded-pill border border-ink/10 py-3 text-body-md text-ink-soft hover:bg-pearl-soft"
        >
          閉じる
        </button>
      </div>
    </div>
  );
}

function ActionRow({
  icon,
  label,
  sub,
  destructive,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  sub?: string;
  destructive?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 px-3 py-3 rounded-btn text-left active:bg-pearl-soft hover:bg-pearl-soft transition-colors",
        destructive ? "text-wine-deep" : "text-ink",
      )}
    >
      <span className={cn("shrink-0", destructive ? "text-wine-deep" : "text-gold-deep")}>
        {icon}
      </span>
      <span className="flex flex-col">
        <span className="text-body-md font-medium leading-tight">{label}</span>
        {sub && <span className="text-[11px] text-ink-mute mt-0.5">{sub}</span>}
      </span>
    </button>
  );
}

// ═══════════════ 部分コピー モーダル ═══════════════

/**
 * メッセージ本文を選択可能なテキストエリアに出し、選んだ範囲だけ／全文を
 * クリップボードへコピーできるモーダル。長押しでの全文コピーに加え、
 * LINEのテキスト選択コピーに相当する機能を提供する。
 */
export function PartialCopyModal({
  content,
  onClose,
}: {
  content: string;
  onClose: () => void;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);
  const [copied, setCopied] = useState<"none" | "part" | "all">("none");
  const [noSelection, setNoSelection] = useState(false);

  const copy = (text: string, kind: "part" | "all") => {
    if (typeof navigator === "undefined" || !navigator.clipboard) return;
    navigator.clipboard
      .writeText(text)
      .then(() => {
        setCopied(kind);
        setTimeout(onClose, 700);
      })
      .catch(() => {});
  };

  const copySelection = () => {
    const el = ref.current;
    if (!el) return;
    const sel = content.slice(el.selectionStart ?? 0, el.selectionEnd ?? 0);
    if (!sel.trim()) {
      setNoSelection(true);
      el.focus();
      return;
    }
    copy(sel, "part");
  };

  return (
    <div
      className="fixed inset-0 z-[80] flex items-end justify-center bg-ink/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-t-[24px] bg-pearl border-t border-gold/20 shadow-luxe px-5 pt-3 pb-safe animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-ink/15" />

        <div className="flex items-center gap-2 mb-2">
          <TextCursorInput size={15} className="text-gold-deep shrink-0" />
          <h2 className="font-serif text-[16px] font-medium text-ink">部分コピー</h2>
          <button
            type="button"
            onClick={onClose}
            className="ml-auto w-8 h-8 rounded-full flex items-center justify-center text-ink-mute hover:bg-pearl-soft"
            aria-label="閉じる"
          >
            <X size={16} />
          </button>
        </div>

        <p className="text-[11px] text-ink-mute mb-2">
          コピーしたい部分を選択して「選択範囲をコピー」を押してください。
        </p>

        <textarea
          ref={ref}
          readOnly
          defaultValue={content}
          rows={5}
          onSelect={() => setNoSelection(false)}
          className="w-full resize-none rounded-2xl border border-ink/[0.08] bg-pearl-light px-3 py-2 text-body-md text-ink focus:outline-none focus:border-wine-deep select-text"
          style={{ fontSize: "16px" }}
        />

        {noSelection && (
          <p className="mt-1.5 text-[11px] text-wine-deep">
            コピーする範囲が選択されていません。
          </p>
        )}

        <div className="mt-3 flex items-center gap-2">
          <button
            type="button"
            onClick={copySelection}
            className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-pill bg-wine-deep text-pearl-light px-4 py-2.5 text-body-md font-medium shadow-warm"
          >
            {copied === "part" ? <Check size={14} /> : <TextCursorInput size={14} />}
            {copied === "part" ? "コピーしました" : "選択範囲をコピー"}
          </button>
          <button
            type="button"
            onClick={() => copy(content, "all")}
            className="inline-flex items-center justify-center gap-1.5 rounded-pill border border-ink/15 px-4 py-2.5 text-body-md text-ink-soft hover:bg-pearl-soft"
          >
            {copied === "all" ? <Check size={14} /> : <Copy size={14} />}
            全文
          </button>
        </div>
      </div>
    </div>
  );
}
