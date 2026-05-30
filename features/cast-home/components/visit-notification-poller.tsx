"use client";

import { Bell, Crown, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { checkRecentVisitsAction } from "../actions";

interface Props {
  castId: string;
}

interface NotifiedVisit {
  id: string;
  customerId: string;
  customerName: string;
  isNominated: boolean;
  tableName: string | null;
  visitedAt: string;
}

const POLL_INTERVAL_MS = 30_000; // 30 seconds — safe for both demo and prod

/**
 * Polls the server every 30 seconds for new visits assigned to this cast
 * and shows a sliding-in toast at the top of the cast home when a new
 * one shows up. Tap the toast → jump to the customer card.
 *
 * Tracks the "last seen" timestamp in localStorage so revisits don't
 * re-toast already-seen visits.
 */
export function VisitNotificationPoller({ castId }: Props) {
  const [pending, setPending] = useState<NotifiedVisit[]>([]);
  const sinceRef = useRef<string>(new Date().toISOString());
  const isMountedRef = useRef(true);

  useEffect(() => {
    // Restore last-seen timestamp from localStorage
    const stored = window.localStorage.getItem(`nightos.last-seen.${castId}`);
    if (stored) {
      sinceRef.current = stored;
    }

    isMountedRef.current = true;
    const tick = async () => {
      try {
        const result = await checkRecentVisitsAction(castId, sinceRef.current);
        if (!isMountedRef.current) return;
        if (result.visits.length === 0) return;

        const enriched: NotifiedVisit[] = result.visits.map((v) => ({
          id: v.id,
          customerId: v.customer_id,
          customerName: v.customerName,
          isNominated: v.is_nominated,
          tableName: v.table_name,
          visitedAt: v.visited_at,
        }));

        // Advance the cursor + persist
        const latest = result.visits[0].visited_at;
        sinceRef.current = latest;
        window.localStorage.setItem(`nightos.last-seen.${castId}`, latest);

        setPending((prev) => {
          // Avoid duplicates
          const seen = new Set(prev.map((p) => p.id));
          const fresh = enriched.filter((v) => !seen.has(v.id));
          return [...fresh, ...prev].slice(0, 3); // cap at 3 stacked toasts
        });
      } catch (err) {
        console.error("[visit-poller]", err);
      }
    };

    // First tick after a short delay so the page mounts cleanly
    const initial = setTimeout(tick, 2000);
    const interval = setInterval(tick, POLL_INTERVAL_MS);

    return () => {
      isMountedRef.current = false;
      clearTimeout(initial);
      clearInterval(interval);
    };
  }, [castId]);

  const dismiss = (id: string) => {
    setPending((prev) => prev.filter((p) => p.id !== id));
  };

  if (pending.length === 0) return null;

  return (
    <div
      className="fixed left-0 right-0 z-50 px-4 pointer-events-none"
      style={{ top: "calc(env(safe-area-inset-top, 0px) + 1rem)" }}
    >
      <div className="mx-auto max-w-[520px] space-y-2">
        {pending.map((v) => (
          <Link
            key={v.id}
            href={`/cast/customers/${v.customerId}`}
            onClick={() => dismiss(v.id)}
            className="block pointer-events-auto"
          >
            <div className="flex items-center gap-3 px-4 py-3 rounded-card bg-pearl-warm/95 backdrop-blur-md border border-gold/30 shadow-warm animate-fade-in">
              <div className="w-10 h-10 rounded-full border border-gold/40 flex items-center justify-center shrink-0">
                <Bell size={18} className="text-gold-deep" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[11px] text-ink-mute mb-0.5">
                  新しい来店
                </div>
                <div className="text-body-md font-medium text-ink flex items-center gap-1.5 truncate">
                  {v.customerName}さま
                  {v.isNominated && (
                    <Crown size={11} className="text-gold shrink-0" />
                  )}
                </div>
                {(v.tableName || v.isNominated) && (
                  <div className="text-[11px] text-ink-soft">
                    {v.tableName && `テーブル: ${v.tableName}`}
                    {v.tableName && v.isNominated && " · "}
                    {v.isNominated && "指名"}
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  dismiss(v.id);
                }}
                className="p-1 rounded-full hover:bg-pearl-soft shrink-0 text-ink-mute"
                aria-label="閉じる"
              >
                <X size={14} />
              </button>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
