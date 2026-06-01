"use client";

import { useRef, useState } from "react";
import { ImagePlus, Loader2, Send, Sparkles, User, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { SAKURA_MAMA_CHAT_NAME } from "@/lib/nightos/constants";
import type { ChatAttachment } from "../types";
import {
  MAX_ATTACHMENTS,
  isAllowedImage,
  uploadChatImage,
} from "../lib/upload-attachment";

interface PendingAttachment extends ChatAttachment {
  key: string;
  uploading: boolean;
  failed?: boolean;
}

export interface ComposerPayload {
  text: string;
  attachments: ChatAttachment[];
}

/** A group member (cast/staff in the room) that can be @mentioned. */
export interface MentionMember {
  id: string;
  name: string;
}

interface Props {
  value: string;
  onChange: (v: string) => void;
  onSend: (payload: ComposerPayload) => void;
  sending: boolean;
  /** Other members in this room (excluding self), for @関係者 mentions. */
  members?: MentionMember[];
  storeId: string;
  roomId: string;
  placeholder?: string;
}

function normalize(s: string): string {
  return s.toLowerCase().replace(/\s|　/g, "");
}

/** Trailing `@token` (no whitespace) at the end of the text. */
const MENTION_RE = /@([^@\s　]*)$/;

export function ChatComposer({
  value,
  onChange,
  onSend,
  sending,
  members = [],
  storeId,
  roomId,
  placeholder = "メッセージを入力...",
}: Props) {
  const [attachments, setAttachments] = useState<PendingAttachment[]>([]);
  const [mentionQuery, setMentionQuery] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const uploading = attachments.some((a) => a.uploading);
  const canSend =
    !sending && !uploading && (value.trim().length > 0 || attachments.length > 0);

  const handleChange = (next: string) => {
    onChange(next);
    const m = next.match(MENTION_RE);
    setMentionQuery(m ? m[1] : null);
  };

  const pickMentionAi = () => {
    const replaced = value.replace(MENTION_RE, `@${SAKURA_MAMA_CHAT_NAME} `);
    onChange(replaced);
    setMentionQuery(null);
  };

  // 関係者（同室メンバー）メンション — 顧客と違いカルテ連携は伴わない。
  const pickMentionMember = (m: MentionMember) => {
    const replaced = value.replace(MENTION_RE, `@${m.name} `);
    onChange(replaced);
    setMentionQuery(null);
  };

  const addFiles = async (files: File[]) => {
    const current = attachments.length;
    const allowed = files
      .filter(isAllowedImage)
      .slice(0, MAX_ATTACHMENTS - current);
    for (const file of allowed) {
      const key = `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
      const localUrl = URL.createObjectURL(file);
      setAttachments((prev) => [
        ...prev,
        { key, url: localUrl, path: null, mime: file.type, uploading: true },
      ]);
      try {
        const uploaded = await uploadChatImage({ file, storeId, roomId });
        setAttachments((prev) =>
          prev.map((a) =>
            a.key === key ? { ...a, ...uploaded, uploading: false } : a,
          ),
        );
      } catch {
        setAttachments((prev) =>
          prev.map((a) =>
            a.key === key ? { ...a, uploading: false, failed: true } : a,
          ),
        );
      }
    }
  };

  const removeAttachment = (key: string) =>
    setAttachments((prev) => prev.filter((a) => a.key !== key));

  const handlePaste = (e: React.ClipboardEvent) => {
    const imgs = Array.from(e.clipboardData.items)
      .filter((it) => it.type.startsWith("image/"))
      .map((it) => it.getAsFile())
      .filter((f): f is File => !!f);
    if (imgs.length > 0) {
      e.preventDefault();
      void addFiles(imgs);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const imgs = Array.from(e.dataTransfer.files).filter((f) =>
      f.type.startsWith("image/"),
    );
    if (imgs.length > 0) void addFiles(imgs);
  };

  const submit = () => {
    if (!canSend) return;
    onSend({
      text: value.trim(),
      attachments: attachments
        .filter((a) => !a.failed)
        .map((a) => ({
          url: a.url,
          path: a.path,
          mime: a.mime,
          width: a.width,
          height: a.height,
        })),
    });
    setAttachments([]);
    setMentionQuery(null);
  };

  const memberResults =
    mentionQuery !== null
      ? members.filter((m) => {
          const q = normalize(mentionQuery);
          return q === "" || normalize(m.name).includes(q);
        })
      : [];
  const showAiOption =
    mentionQuery !== null &&
    SAKURA_MAMA_CHAT_NAME.includes(mentionQuery) &&
    mentionQuery.length <= SAKURA_MAMA_CHAT_NAME.length;
  const showMentions =
    mentionQuery !== null && (memberResults.length > 0 || showAiOption);

  return (
    <div
      className={cn(
        "relative",
        dragOver && "ring-2 ring-gold/60 rounded-2xl",
      )}
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
    >
      {/* Mention autocomplete */}
      {showMentions && (
        <div className="absolute bottom-full left-0 right-0 mb-2 max-h-60 overflow-y-auto rounded-card border border-ink/[0.06] bg-pearl shadow-warm z-30">
          {showAiOption && (
            <button
              type="button"
              onClick={pickMentionAi}
              className="w-full flex items-center gap-2 px-3 py-2.5 text-left hover:bg-pearl-soft"
            >
              <span className="w-7 h-7 rounded-full bg-champagne-soft/60 flex items-center justify-center text-gold-deep">
                <Sparkles size={14} />
              </span>
              <span className="text-body-sm font-medium text-gold-deep">
                {SAKURA_MAMA_CHAT_NAME}
              </span>
              <span className="ml-auto text-[10px] text-ink-mute">AIに相談</span>
            </button>
          )}
          {memberResults.length > 0 && showAiOption && (
            <div className="px-3 pt-2 pb-1 text-[10px] font-medium tracking-wide text-ink-mute">
              関係者
            </div>
          )}
          {memberResults.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => pickMentionMember(m)}
              className="w-full flex items-center gap-2 px-3 py-2.5 text-left hover:bg-pearl-soft"
            >
              <span className="w-7 h-7 rounded-full bg-pearl-soft border border-ink/[0.08] flex items-center justify-center text-ink-soft">
                <User size={13} />
              </span>
              <span className="text-body-sm text-ink font-medium">{m.name}</span>
              <span className="ml-auto text-[10px] text-ink-mute">メンバー</span>
            </button>
          ))}
        </div>
      )}

      {/* Attachment previews */}
      {attachments.length > 0 && (
        <div className="flex gap-2 pb-2 flex-wrap">
          {attachments.map((a) => (
            <div
              key={a.key}
              className="relative w-16 h-16 rounded-xl overflow-hidden border border-ink/[0.08] bg-pearl-soft"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={a.url}
                alt="添付画像"
                className="w-full h-full object-cover"
              />
              {a.uploading && (
                <div className="absolute inset-0 bg-ink/40 flex items-center justify-center">
                  <Loader2 size={16} className="animate-spin text-pearl-light" />
                </div>
              )}
              {a.failed && (
                <div className="absolute inset-0 bg-wine-deep/60 flex items-center justify-center text-[9px] text-pearl-light px-1 text-center">
                  失敗
                </div>
              )}
              <button
                type="button"
                onClick={() => removeAttachment(a.key)}
                className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full bg-ink/60 text-pearl-light flex items-center justify-center"
                aria-label="削除"
              >
                <X size={11} />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-end gap-2">
        <input
          ref={fileRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif"
          multiple
          className="hidden"
          onChange={(e) => {
            void addFiles(Array.from(e.target.files ?? []));
            e.target.value = "";
          }}
        />
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={attachments.length >= MAX_ATTACHMENTS}
          className="shrink-0 mb-1 p-1.5 rounded-full text-gold-deep hover:bg-champagne-soft/60 disabled:opacity-40"
          title="画像を添付"
          aria-label="画像を添付"
        >
          <ImagePlus size={18} />
        </button>
        <div className="flex-1">
          <textarea
            value={value}
            onChange={(e) => handleChange(e.target.value)}
            onPaste={handlePaste}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                submit();
              }
            }}
            placeholder={placeholder}
            rows={1}
            className="w-full resize-none rounded-2xl border border-ink/[0.08] bg-pearl-light px-3 py-2 text-body-md text-ink placeholder:text-ink-mute focus:outline-none focus:border-wine-deep"
            style={{ fontSize: "16px", maxHeight: "160px" }}
          />
        </div>
        <button
          type="button"
          onClick={submit}
          disabled={!canSend}
          className={cn(
            "shrink-0 mb-1 p-2 rounded-full transition-colors",
            canSend ? "bg-wine-deep text-pearl-light" : "bg-pearl-soft text-ink-mute",
          )}
          aria-label="送信"
          title="送信（⌘/Ctrl+Enter）"
        >
          {sending || uploading ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Send size={16} />
          )}
        </button>
      </div>
    </div>
  );
}
