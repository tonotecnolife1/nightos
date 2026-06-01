"use client";

import { useLayoutEffect, useRef, useState } from "react";
import {
  Bookmark,
  Check,
  Copy,
  Pencil,
  Reply,
  TextCursorInput,
  Trash2,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

/** Viewport-space rect of the long-pressed bubble (from getBoundingClientRect). */
export interface AnchorRect {
  top: number;
  bottom: number;
  left: number;
  width: number;
}

interface ActionSheetProps {
  anchorRect: AnchorRect;
  hasText: boolean;
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

interface ActionItem {
  key: string;
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  destructive?: boolean;
  active?: boolean;
}

/**
 * LINE風の長押しメニュー。吹き出しを長押し（PCは右クリック）で、その吹き出しに
 * アンカーしたダークなアイコングリッドを浮かせる。常時表示のアクション列を廃した
 * のでスクロール中の誤タップが起きない。
 */
export function MessageActionSheet({
  anchorRect,
  hasText,
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
  const menuRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{
    left: number;
    top: number;
    placement: "top" | "bottom";
    pointerX: number;
  } | null>(null);

  const items: ActionItem[] = [
    canReply && {
      key: "reply",
      icon: <Reply size={20} />,
      label: "リプライ",
      onClick: onReply,
    },
    hasText && {
      key: "copy",
      icon: <Copy size={20} />,
      label: "コピー",
      onClick: onCopyAll,
    },
    hasText && {
      key: "partial",
      icon: <TextCursorInput size={20} />,
      label: "部分コピー",
      onClick: onPartialCopy,
    },
    {
      key: "keep",
      icon: <Bookmark size={20} />,
      label: isPinned ? "保存を編集" : "保存",
      onClick: onPin,
      active: isPinned,
    },
    canEdit && {
      key: "edit",
      icon: <Pencil size={20} />,
      label: "編集",
      onClick: onEdit,
    },
    canEdit && {
      key: "delete",
      icon: <Trash2 size={20} />,
      label: "送信取消",
      onClick: onDelete,
      destructive: true,
    },
  ].filter(Boolean) as ActionItem[];

  const cols = Math.min(items.length, 5);

  // Position the menu over the bubble: above if there's room, else below,
  // clamped to the viewport. Measured after render for accuracy.
  useLayoutEffect(() => {
    const el = menuRef.current;
    if (!el) return;
    const mw = el.offsetWidth;
    const mh = el.offsetHeight;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const margin = 8;
    const gap = 10;

    const centerX = anchorRect.left + anchorRect.width / 2;
    let left = centerX - mw / 2;
    left = Math.max(margin, Math.min(left, vw - mw - margin));

    let placement: "top" | "bottom" = "top";
    let top = anchorRect.top - mh - gap;
    if (top < margin) {
      placement = "bottom";
      top = anchorRect.bottom + gap;
      if (top + mh > vh - margin) top = Math.max(margin, vh - mh - margin);
    }

    const pointerX = Math.max(14, Math.min(centerX - left, mw - 14));
    setPos({ left, top, placement, pointerX });
  }, [anchorRect]);

  return (
    <div
      className="fixed inset-0 z-[70] bg-ink/20 animate-fade-in"
      onClick={onClose}
    >
      <div
        ref={menuRef}
        onClick={(e) => e.stopPropagation()}
        style={{
          left: pos?.left ?? -9999,
          top: pos?.top ?? -9999,
          opacity: pos ? 1 : 0,
        }}
        className="fixed transition-opacity duration-100"
      >
        <div
          className="grid gap-px overflow-hidden rounded-[18px] bg-pearl-light/10 shadow-luxe"
          style={{
            gridTemplateColumns: `repeat(${cols}, 4rem)`,
          }}
        >
          {items.map((it) => (
            <button
              key={it.key}
              type="button"
              onClick={it.onClick}
              className={cn(
                "flex flex-col items-center justify-center gap-1.5 h-[68px] bg-ink/95 active:bg-ink text-pearl-light",
                it.destructive && "text-[#e89aa0]",
                it.active && "text-gold",
              )}
            >
              {it.icon}
              <span className="text-[10px] tracking-[0.02em] leading-none">
                {it.label}
              </span>
            </button>
          ))}
        </div>

        {/* Pointer toward the bubble */}
        {pos && (
          <div
            className="absolute w-3 h-3 rotate-45 bg-ink/95"
            style={{
              left: pos.pointerX - 6,
              ...(pos.placement === "top"
                ? { bottom: -5 }
                : { top: -5 }),
            }}
          />
        )}
      </div>
    </div>
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
