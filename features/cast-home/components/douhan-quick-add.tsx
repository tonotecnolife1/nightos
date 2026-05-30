"use client";

import { useState } from "react";
import { CalendarPlus, X, Check } from "lucide-react";
import type { Customer, Douhan } from "@/types/nightos";
import { upsertDouhan } from "@/lib/nightos/douhan-store";
import { useCastId } from "@/lib/nightos/cast-context";

function todayStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/**
 * Full-width bottom CTA to quickly register a 同伴 (douhan).
 * Opens a bottom sheet with a minimal form (customer / date / note).
 */
export function DouhanQuickAdd({ customers }: { customers: Customer[] }) {
  const castId = useCastId();
  const [open, setOpen] = useState(false);
  const [customerId, setCustomerId] = useState("");
  const [date, setDate] = useState(todayStr());
  const [note, setNote] = useState("");
  const [saved, setSaved] = useState(false);

  const canSubmit = customerId !== "" && date !== "";

  const handleSubmit = () => {
    if (!canSubmit) return;
    const customer = customers.find((c) => c.id === customerId);
    const entry: Douhan = {
      id: `douhan_${Date.now()}`,
      cast_id: castId,
      customer_id: customerId,
      store_id: customer?.store_id ?? "",
      date,
      note: note.trim() || null,
      status: "scheduled",
      created_at: new Date().toISOString(),
    };
    upsertDouhan(entry);
    setSaved(true);
    setTimeout(() => {
      setOpen(false);
      setSaved(false);
      setCustomerId("");
      setNote("");
      setDate(todayStr());
    }, 1200);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="w-full inline-flex items-center justify-center gap-2 h-[52px] rounded-pill border border-gold-deep/40 bg-champagne-soft/50 text-gold-deep font-sans font-semibold tracking-[0.04em] text-[14px] shadow-soft active:scale-[0.99] hover:bg-champagne-soft/70 transition"
      >
        <CalendarPlus size={16} strokeWidth={1.8} />
        同伴を登録
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center"
          role="dialog"
          aria-modal="true"
        >
          <button
            type="button"
            aria-label="閉じる"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-ink/40 animate-fade-in"
          />
          <div className="relative w-full max-w-[520px] bg-pearl-light rounded-sheet shadow-luxe p-5 pb-8 space-y-4 animate-fade-in">
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-[18px] tracking-[0.04em] text-ink">
                同伴を登録
              </h3>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="閉じる"
                className="p-1.5 -mr-1.5 rounded-full text-ink-soft hover:bg-pearl-soft transition"
              >
                <X size={18} />
              </button>
            </div>

            {saved ? (
              <p className="flex items-center gap-2 text-body-md text-success py-6 justify-center">
                <Check size={18} />
                登録しました
              </p>
            ) : (
              <>
                <label className="block space-y-1.5">
                  <span className="text-label-sm text-ink-soft">お客様</span>
                  <select
                    value={customerId}
                    onChange={(e) => setCustomerId(e.target.value)}
                    className="w-full h-11 px-3 rounded-btn border border-pearl-soft bg-pearl-warm text-body-md text-ink focus:outline-none focus:border-gold/40"
                  >
                    <option value="">選択してください</option>
                    {customers.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}さま
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block space-y-1.5">
                  <span className="text-label-sm text-ink-soft">日付</span>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full h-11 px-3 rounded-btn border border-pearl-soft bg-pearl-warm text-body-md text-ink focus:outline-none focus:border-gold/40"
                  />
                </label>

                <label className="block space-y-1.5">
                  <span className="text-label-sm text-ink-soft">
                    メモ・お店（任意）
                  </span>
                  <input
                    type="text"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="例: 19:00 銀座〇〇で待ち合わせ"
                    className="w-full h-11 px-3 rounded-btn border border-pearl-soft bg-pearl-warm text-body-md text-ink placeholder:text-ink-mute focus:outline-none focus:border-gold/40"
                  />
                </label>

                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={!canSubmit}
                  className="w-full h-12 rounded-pill border border-gold-deep/40 bg-champagne-soft/60 text-gold-deep font-semibold tracking-[0.04em] shadow-soft active:scale-[0.99] transition disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  登録する
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
