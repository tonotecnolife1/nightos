"use client";

import { Check, Pencil, X } from "lucide-react";
import { useState, useTransition } from "react";
import { MemoCard } from "@/components/nightos/card";
import type { CastMemo, Customer } from "@/types/nightos";
import { updateCastMemoAction } from "../actions";

interface Props {
  customer: Customer;
  memo: CastMemo | null;
}

export function MemoSection({ customer, memo }: Props) {
  const [editing, setEditing] = useState(false);
  const [lastTopic, setLastTopic] = useState(memo?.last_topic ?? "");
  const [serviceTips, setServiceTips] = useState(memo?.service_tips ?? "");
  const [nextTopics, setNextTopics] = useState(memo?.next_topics ?? "");
  const [pending, startTransition] = useTransition();
  const [savedAt, setSavedAt] = useState<number | null>(null);

  const save = () => {
    startTransition(async () => {
      await updateCastMemoAction({
        customerId: customer.id,
        input: {
          last_topic: lastTopic.trim() || null,
          service_tips: serviceTips.trim() || null,
          next_topics: nextTopics.trim() || null,
        },
      });
      setEditing(false);
      setSavedAt(Date.now());
    });
  };

  const cancel = () => {
    setLastTopic(memo?.last_topic ?? "");
    setServiceTips(memo?.service_tips ?? "");
    setNextTopics(memo?.next_topics ?? "");
    setEditing(false);
  };

  return (
    <MemoCard title="個人メモ">
      <div className="space-y-3">
        <MemoField
          label="前回の話題"
          value={lastTopic}
          onChange={setLastTopic}
          editing={editing}
          placeholder="例: 息子さんの受験、ゴルフ旅行の話など"
        />
        <MemoField
          label="接客のコツ"
          value={serviceTips}
          onChange={setServiceTips}
          editing={editing}
          placeholder="例: 最初は仕事の話から、2杯目以降にプライベート"
        />
        <MemoField
          label="次回の話題候補"
          value={nextTopics}
          onChange={setNextTopics}
          editing={editing}
          placeholder="例: 春のGIシリーズ、新しいプロジェクトの進捗"
        />

        <div className="flex items-center gap-2 justify-end pt-1">
          {editing ? (
            <>
              <button
                type="button"
                onClick={cancel}
                disabled={pending}
                className="flex items-center gap-1 h-9 px-3 rounded-btn text-label-sm text-ink-soft bg-pearl-soft hover:bg-pearl-warm"
              >
                <X size={14} />
                キャンセル
              </button>
              <button
                type="button"
                onClick={save}
                disabled={pending}
                className="flex items-center gap-1 h-9 px-4 rounded-btn text-label-sm text-pearl-light bg-wine-deep shadow-soft disabled:opacity-60"
              >
                <Check size={14} />
                {pending ? "保存中…" : "保存"}
              </button>
            </>
          ) : (
            <>
              {savedAt && (
                <span className="text-label-sm text-gold-deep">
                  保存しました
                </span>
              )}
              <button
                type="button"
                onClick={() => setEditing(true)}
                className="flex items-center gap-1 h-9 px-3 rounded-btn text-label-sm text-wine-deep bg-champagne-soft/60 hover:bg-wine-deep"
              >
                <Pencil size={14} />
                編集する
              </button>
            </>
          )}
        </div>
      </div>
    </MemoCard>
  );
}

function MemoField({
  label,
  value,
  onChange,
  editing,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  editing: boolean;
  placeholder: string;
}) {
  return (
    <div>
      <div className="text-label-sm text-wine-deep mb-1">{label}</div>
      {editing ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={3}
          style={{ fontSize: "16px" }}
          className="w-full max-h-40 rounded-btn border border-gold/40 bg-pearl-warm px-3 py-2 text-ink outline-none focus:border-wine-deep resize-none leading-relaxed"
        />
      ) : (
        <div className="text-body-md text-ink leading-relaxed min-h-[1.5rem] max-h-32 overflow-y-auto whitespace-pre-wrap break-words">
          {value || <span className="text-ink-mute">未記入</span>}
        </div>
      )}
    </div>
  );
}
