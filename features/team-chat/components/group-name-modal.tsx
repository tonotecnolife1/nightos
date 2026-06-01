"use client";

import { useState } from "react";
import { Check } from "lucide-react";

/**
 * Small modal for renaming a chat group. The name is persisted by the caller
 * (localStorage via chat-room-name-store); an empty value clears the override
 * and falls back to `baseName` (channel name / joined member names).
 */
export function GroupNameModal({
  baseName,
  initialName,
  onClose,
  onSubmit,
}: {
  baseName: string;
  initialName: string;
  onClose: () => void;
  onSubmit: (name: string) => void;
}) {
  const [draft, setDraft] = useState(initialName);
  const commit = () => onSubmit(draft);

  return (
    <div
      className="fixed inset-0 z-[60] bg-ink/40 backdrop-blur-sm flex items-end sm:items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-card bg-pearl border border-ink/[0.06] shadow-warm p-4 space-y-3"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-body-md font-medium text-ink">グループ名</div>
        <input
          autoFocus
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              commit();
            }
            if (e.key === "Escape") {
              e.preventDefault();
              onClose();
            }
          }}
          placeholder={baseName}
          className="w-full rounded-2xl border border-ink/[0.08] bg-pearl-light px-3 py-2 text-body-md text-ink placeholder:text-ink-mute focus:outline-none focus:border-wine-deep"
          style={{ fontSize: "16px" }}
        />
        <p className="text-[11px] text-ink-mute">
          空にするとメンバー名（{baseName}）に戻ります
        </p>
        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 rounded-pill text-label-sm text-ink-soft hover:bg-pearl-soft"
          >
            キャンセル
          </button>
          <button
            type="button"
            onClick={commit}
            className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-pill bg-wine-deep text-pearl-light text-label-sm font-medium shadow-warm"
          >
            <Check size={13} />
            保存
          </button>
        </div>
      </div>
    </div>
  );
}
