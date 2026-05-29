"use client";

import { useEffect, useState } from "react";
import {
  CalendarCheck,
  Check,
  ChevronDown,
  ChevronUp,
  Clock,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import { Card } from "@/components/nightos/card";
import { cn, formatCustomerName } from "@/lib/utils";
import { CURRENT_STORE_ID } from "@/lib/nightos/constants";
import { useCastId } from "@/lib/nightos/cast-context";
import {
  deleteDouhan,
  loadDouhansForCast,
  upsertDouhan,
} from "@/lib/nightos/douhan-store";
import type { Customer, Douhan } from "@/types/nightos";

interface Props {
  customers: Customer[];
  monthlyGoal?: number;
}

export function DouhanTracker({ customers, monthlyGoal = 8 }: Props) {
  const castId = useCastId();
  const [entries, setEntries] = useState<Douhan[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setEntries(loadDouhansForCast(castId));
    setLoaded(true);
  }, [castId]);

  const refresh = () => setEntries(loadDouhansForCast(castId));

  const addEntry = (customerId: string, date: string, note: string) => {
    const entry: Douhan = {
      id: `d_${Date.now()}`,
      cast_id: castId,
      customer_id: customerId,
      store_id: CURRENT_STORE_ID,
      date,
      note: note || null,
      status: "scheduled",
      created_at: new Date().toISOString(),
    };
    upsertDouhan(entry);
    refresh();
    setShowForm(false);
  };

  const updateStatus = (entry: Douhan, status: Douhan["status"]) => {
    upsertDouhan({ ...entry, status });
    refresh();
  };

  const cancelEntry = (entry: Douhan, reason: string) => {
    upsertDouhan({
      ...entry,
      status: "cancelled",
      cancellation_reason: reason,
      cancelled_at: new Date().toISOString(),
    });
    refresh();
  };

  const removeEntry = (id: string) => {
    deleteDouhan(id);
    refresh();
  };

  // This month's entries
  const now = new Date();
  const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const thisMonth = entries.filter((e) => e.date.startsWith(monthKey));
  const completedCount = thisMonth.filter((e) => e.status === "completed").length;
  const pct = monthlyGoal > 0 ? Math.round((completedCount / monthlyGoal) * 100) : 0;

  const scheduled = thisMonth
    .filter((e) => e.status === "scheduled")
    .sort((a, b) => a.date.localeCompare(b.date));
  const completed = thisMonth
    .filter((e) => e.status === "completed")
    .sort((a, b) => b.date.localeCompare(a.date));
  const cancelled = thisMonth.filter((e) => e.status === "cancelled");

  // 顧客名解決用
  const customerNameById = new Map(customers.map((c) => [c.id, c.name]));
  const getCustomerName = (id: string) => customerNameById.get(id) ?? "不明";

  if (!loaded) return null;

  return (
    <section className="space-y-2.5">
      {/* Header + Add button */}
      <div className="relative flex items-center justify-between pl-3.5">
        <span
          aria-hidden
          className="absolute left-0 top-1 bottom-1 w-[3px] rounded bg-rose-gold-metallic"
        />
        <h2 className="font-serif text-[19px] leading-[1.3] font-medium tracking-[0.02em] text-ink flex items-center gap-1.5">
          <CalendarCheck size={16} className="text-gold-deep" />
          同伴
        </h2>
        <button
          type="button"
          onClick={() => setShowForm(true)}
          className="inline-flex items-center gap-1 h-8 px-3 rounded-pill bg-roseGold-deep text-pearl-light text-[11px] font-semibold tracking-[0.04em] active:scale-[0.97] shadow-soft hover:-translate-y-px transition"
        >
          <Plus size={12} />
          同伴を登録
        </button>
      </div>

      {/* ── Add form ── */}
      {showForm && (
        <AddForm
          customers={customers}
          onAdd={addEntry}
          onClose={() => setShowForm(false)}
        />
      )}

      {/* Progress */}
      <Card className="p-3.5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-body-sm text-ink font-medium">
            今月{" "}
            <span className="font-display text-[18px] tabular-nums text-roseGold-deep">
              {completedCount}
            </span>{" "}
            / {monthlyGoal} 回
          </span>
          <span className="text-label-xs tracking-luxe text-ink-mute uppercase">
            {pct >= 100 ? "達成 ✨" : `あと${monthlyGoal - completedCount}回`}
          </span>
        </div>
        <div className="h-1.5 bg-pearl-soft rounded-full overflow-hidden">
          <div
            className="h-full bg-rose-gold-metallic rounded-full transition-all"
            style={{ width: `${Math.min(pct, 100)}%` }}
          />
        </div>
      </Card>

      {/* ── Scheduled ── */}
      {scheduled.length > 0 && (
        <div className="space-y-1.5">
          <h3 className="text-[11px] text-ink-soft font-medium px-0.5">
            予定（{scheduled.length}件）
          </h3>
          {scheduled.map((e) => (
            <EntryCard
              key={e.id}
              entry={e}
              customerName={getCustomerName(e.customer_id)}
              onComplete={() => updateStatus(e, "completed")}
              onCancel={(reason) => cancelEntry(e, reason)}
              onDelete={() => removeEntry(e.id)}
            />
          ))}
        </div>
      )}

      {/* ── Completed ── */}
      {completed.length > 0 && (
        <div className="space-y-1.5">
          <button
            type="button"
            onClick={() => setShowAll(!showAll)}
            className="flex items-center gap-1 text-[11px] text-ink-soft font-medium px-0.5"
          >
            完了（{completed.length}件）
            {showAll ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
          </button>
          {(showAll ? completed : completed.slice(0, 2)).map((e) => (
            <EntryCard
              key={e.id}
              entry={e}
              customerName={getCustomerName(e.customer_id)}
              onRevert={() => updateStatus(e, "scheduled")}
              onDelete={() => removeEntry(e.id)}
            />
          ))}
          {!showAll && completed.length > 2 && (
            <button
              type="button"
              onClick={() => setShowAll(true)}
              className="text-[10px] text-ink-soft underline-offset-2 hover:underline px-0.5"
            >
              他{completed.length - 2}件を表示
            </button>
          )}
        </div>
      )}

      {/* ── Cancelled ── */}
      {cancelled.length > 0 && (
        <div className="space-y-1.5">
          <h3 className="text-[11px] text-ink-soft font-medium px-0.5">
            キャンセル（{cancelled.length}件）
          </h3>
          {cancelled.map((e) => (
            <EntryCard
              key={e.id}
              entry={e}
              customerName={getCustomerName(e.customer_id)}
              onDelete={() => removeEntry(e.id)}
            />
          ))}
        </div>
      )}

      {thisMonth.length === 0 && !showForm && (
        <div className="text-center py-4 text-body-sm text-ink-mute">
          今月の同伴はまだありません
        </div>
      )}
    </section>
  );
}

// ═══════════════ Entry Card ═══════════════

// よくあるキャンセル理由（ワンタップ入力用）
const CANCEL_REASON_PRESETS = [
  "お客様の都合（仕事）",
  "お客様の都合（体調不良）",
  "お客様の都合（その他）",
  "日程変更",
  "自分の都合",
];

function EntryCard({
  entry,
  customerName,
  onComplete,
  onCancel,
  onRevert,
  onDelete,
}: {
  entry: Douhan;
  customerName: string;
  onComplete?: () => void;
  onCancel?: (reason: string) => void;
  onRevert?: () => void;
  onDelete: () => void;
}) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [showCancelForm, setShowCancelForm] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const isScheduled = entry.status === "scheduled";
  const isCompleted = entry.status === "completed";
  const isCancelled = entry.status === "cancelled";
  const dateStr = formatDate(entry.date);

  const submitCancel = () => {
    const trimmed = cancelReason.trim();
    if (!trimmed || !onCancel) return;
    onCancel(trimmed);
    setShowCancelForm(false);
    setCancelReason("");
  };

  return (
    <Card
      className={cn(
        "p-2.5 space-y-1.5",
        isCompleted && "opacity-60",
        isCancelled && "opacity-70",
      )}
    >
      {/* Top row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 min-w-0">
          <div
            className={cn(
              "w-6 h-6 rounded-full flex items-center justify-center shrink-0 border",
              isScheduled
                ? "bg-champagne-soft/60 text-gold-deep border-gold/30"
                : isCompleted
                  ? "bg-success/15 text-success border-success/25"
                  : "bg-pearl-soft text-ink-mute border-line-strong",
            )}
          >
            {isScheduled ? (
              <Clock size={11} />
            ) : isCompleted ? (
              <Check size={11} />
            ) : (
              <X size={11} />
            )}
          </div>
          <span className="text-body-sm font-medium text-ink truncate">
            {formatCustomerName(customerName)}
          </span>
        </div>
        <span className="text-[10px] text-ink-mute shrink-0 ml-2">
          {dateStr}
        </span>
      </div>

      {/* Note */}
      {entry.note && (
        <p className="text-[10px] text-ink-soft pl-8 truncate">
          {entry.note}
        </p>
      )}

      {/* Cancellation reason */}
      {isCancelled && entry.cancellation_reason && (
        <p className="text-[10px] text-ink-soft pl-8">
          <span className="text-[#c2575b] font-medium">理由:</span>{" "}
          {entry.cancellation_reason}
        </p>
      )}

      {/* Cancel form (inline) */}
      {showCancelForm && (
        <div className="pl-8 space-y-1.5 pt-1 border-t border-ink/[0.06]">
          <div className="text-[10px] text-ink-soft font-medium">
            キャンセル理由（必須）
          </div>
          <div className="flex flex-wrap gap-1">
            {CANCEL_REASON_PRESETS.map((preset) => (
              <button
                type="button"
                key={preset}
                onClick={() => setCancelReason(preset)}
                className={cn(
                  "text-[10px] h-6 px-2 rounded-full border transition-all active:scale-95",
                  cancelReason === preset
                    ? "bg-roseGold-soft/60 text-roseGold-deep border-blush"
                    : "bg-pearl text-ink-soft border-pearl-soft hover:border-ink-muted",
                )}
              >
                {preset}
              </button>
            ))}
          </div>
          <input
            type="text"
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            placeholder="または自由入力"
            style={{ fontSize: "14px" }}
            className="w-full h-8 rounded-2xl border border-ink/[0.06] bg-pearl-light px-2 text-[12px] text-ink placeholder:text-ink-mute outline-none focus:border-roseGold-deep"
          />
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={submitCancel}
              disabled={!cancelReason.trim()}
              className={cn(
                "h-7 px-3 rounded-full text-[10px] font-medium transition-all active:scale-95",
                cancelReason.trim()
                  ? "border border-[#c2575b]/40 bg-[#c2575b]/5 text-[#c2575b]"
                  : "bg-pearl-soft text-ink-mute cursor-not-allowed",
              )}
            >
              キャンセル確定
            </button>
            <button
              type="button"
              onClick={() => {
                setShowCancelForm(false);
                setCancelReason("");
              }}
              className="text-[10px] text-ink-mute"
            >
              戻る
            </button>
          </div>
        </div>
      )}

      {/* Actions */}
      {!showCancelForm && (
        <div className="flex items-center gap-1 pl-8">
          {isScheduled && onComplete && (
            <button
              type="button"
              onClick={onComplete}
              className="flex items-center gap-0.5 h-6 px-2 rounded-full bg-emerald/10 text-emerald border border-emerald/20 text-[10px] font-medium active:scale-[0.97]"
            >
              <Check size={9} />
              完了にする
            </button>
          )}
          {isScheduled && onCancel && (
            <button
              type="button"
              onClick={() => setShowCancelForm(true)}
              className="flex items-center gap-0.5 h-6 px-2 rounded-full bg-pearl-soft text-ink-mute text-[10px] font-medium active:scale-[0.97]"
            >
              キャンセル
            </button>
          )}
          {isCompleted && onRevert && (
            <button
              type="button"
              onClick={onRevert}
              className="text-[10px] text-ink-mute underline underline-offset-2"
            >
              予定に戻す
            </button>
          )}
          {confirmDelete ? (
            <div className="flex items-center gap-1 ml-auto">
              <span className="text-[10px] text-[#c2575b]">削除する？</span>
              <button
                type="button"
                onClick={onDelete}
                className="text-[10px] text-[#c2575b] font-medium underline"
              >
                はい
              </button>
              <button
                type="button"
                onClick={() => setConfirmDelete(false)}
                className="text-[10px] text-ink-mute"
              >
                いいえ
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmDelete(true)}
              className="ml-auto text-ink-mute"
            >
              <Trash2 size={11} />
            </button>
          )}
        </div>
      )}
    </Card>
  );
}

// ═══════════════ Add Form ═══════════════

function AddForm({
  customers,
  onAdd,
  onClose,
}: {
  customers: Customer[];
  onAdd: (customerId: string, date: string, note: string) => void;
  onClose: () => void;
}) {
  const [customerId, setCustomerId] = useState("");
  const [date, setDate] = useState("");
  const [note, setNote] = useState("");

  const canSubmit = customerId && date;

  const handleSubmit = () => {
    if (!canSubmit) return;
    onAdd(customerId, date, note);
  };

  return (
    <Card className="p-3 space-y-2.5">
      <div className="flex items-center justify-between">
        <h3 className="text-body-sm text-ink font-medium">同伴を登録</h3>
        <button type="button" onClick={onClose} className="text-ink-mute p-0.5">
          <X size={14} />
        </button>
      </div>

      <div className="space-y-2">
        <select
          value={customerId}
          onChange={(e) => setCustomerId(e.target.value)}
          className="w-full h-10 rounded-2xl border border-ink/[0.06] bg-pearl-warm px-3 text-body-sm text-ink focus:outline-none focus:border-roseGold-deep"
          style={{ fontSize: "16px" }}
        >
          <option value="" disabled>
            お客様を選ぶ
          </option>
          {customers.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full h-10 rounded-2xl border border-ink/[0.06] bg-pearl-warm px-3 text-body-sm text-ink focus:outline-none focus:border-roseGold-deep"
          style={{ fontSize: "16px" }}
        />

        <input
          type="text"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="場所やメモ（任意）"
          className="w-full h-10 rounded-2xl border border-ink/[0.06] bg-pearl-light px-3 text-body-sm text-ink placeholder:text-ink-mute focus:outline-none focus:border-roseGold-deep"
          style={{ fontSize: "16px" }}
        />
      </div>

      <button
        type="button"
        onClick={handleSubmit}
        disabled={!canSubmit}
        className={cn(
          "w-full h-10 rounded-pill text-label-sm font-semibold tracking-[0.04em] transition-all active:scale-[0.98]",
          canSubmit
            ? "bg-roseGold-deep text-pearl-light shadow-luxe hover:-translate-y-px"
            : "bg-pearl-soft text-ink-mute cursor-not-allowed",
        )}
      >
        登録する
      </button>
    </Card>
  );
}

// ═══════════════ Helpers ═══════════════

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00+09:00");
  const month = d.getMonth() + 1;
  const day = d.getDate();
  const weekdays = ["日", "月", "火", "水", "木", "金", "土"];
  const dow = weekdays[d.getDay()];
  return `${month}/${day}（${dow}）`;
}
