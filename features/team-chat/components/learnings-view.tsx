"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Bookmark,
  BookmarkCheck,
  BookOpen,
  ChevronRight,
  Loader2,
  RefreshCw,
  Sparkles,
  User,
} from "lucide-react";
import { EmptyState } from "@/components/nightos/empty-state";
import { SAKURA_MAMA_DISPLAY_NAME } from "@/lib/nightos/constants";
import {
  type PinnedMessage,
  getPinnedMessages,
  subscribePins,
} from "@/lib/nightos/chat-pin-store";
import {
  type Learning,
  type LearningsSnapshot,
  getLearningsSnapshot,
  pinsSignature,
  setLearningsSnapshot,
} from "@/lib/nightos/chat-learnings-store";
import {
  type StockedLearning,
  getStockedIds,
  getStockedLearnings,
  learningKey,
  subscribeStock,
  toggleStock,
} from "@/lib/nightos/learning-stock-store";

type SubView = "current" | "stock";

/**
 * 学び tab — asks さくらママ (AI) to read the pinned conversations and organise
 * them into per-customer remember-this cards. Results are cached until the pins
 * change. Good cards can be ストック (stocked) so they survive re-organising.
 */
export function LearningsView() {
  const [pins, setPins] = useState<PinnedMessage[]>([]);
  const [snapshot, setSnapshot] = useState<LearningsSnapshot | null>(null);
  const [stocked, setStocked] = useState<StockedLearning[]>([]);
  const [stockedIds, setStockedIds] = useState<Set<string>>(new Set());
  const [view, setView] = useState<SubView>("current");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    const refreshPins = () => setPins(getPinnedMessages());
    const refreshStock = () => {
      setStocked(getStockedLearnings());
      setStockedIds(getStockedIds());
    };
    refreshPins();
    refreshStock();
    setSnapshot(getLearningsSnapshot());
    const unsubPins = subscribePins(refreshPins);
    const unsubStock = subscribeStock(refreshStock);
    return () => {
      unsubPins();
      unsubStock();
    };
  }, []);

  // Map customer name → id so per-customer sections can link to the カルテ.
  const customerIdByName = useMemo(() => {
    const m = new Map<string, string>();
    for (const p of pins) {
      if (p.customerName && p.customerId) m.set(p.customerName, p.customerId);
    }
    return m;
  }, [pins]);

  const signature = pinsSignature(pins);
  const isStale = !!snapshot && snapshot.signature !== signature;
  const hasFresh = !!snapshot && snapshot.signature === signature;

  const organise = async () => {
    if (pins.length === 0 || loading) return;
    setLoading(true);
    setError(false);
    try {
      const res = await fetch("/api/chat-learnings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pins: pins.map((p) => ({
            content: p.content,
            senderName: p.senderName,
            memo: p.memo,
            customerName: p.customerName,
          })),
        }),
      });
      if (!res.ok) throw new Error("failed");
      const data = (await res.json()) as { learnings: Learning[] };
      const snap: LearningsSnapshot = {
        learnings: data.learnings,
        signature,
        generatedAt: new Date().toISOString(),
      };
      setLearningsSnapshot(snap);
      setSnapshot(snap);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  // Nothing to show at all — no pins to organise and nothing stocked yet.
  if (pins.length === 0 && stocked.length === 0) {
    return (
      <div className="p-5">
        <EmptyState
          icon={<BookOpen size={22} />}
          title="学びはまだありません"
          description={`会話を保存すると、${SAKURA_MAMA_DISPLAY_NAME}がその内容を読み取って、お客様ごとに覚えておくべき学びへ整理します。気に入った学びはストックして残せます。`}
          tone="amethyst"
        />
      </div>
    );
  }

  return (
    <div className="px-5 py-4 space-y-3">
      {/* Sub-view switch */}
      <div className="flex gap-1 rounded-pill bg-champagne-soft/40 border border-gold/20 p-0.5">
        <SubTab
          active={view === "current"}
          onClick={() => setView("current")}
          label="今回の整理"
        />
        <SubTab
          active={view === "stock"}
          onClick={() => setView("stock")}
          label={`ストック${stocked.length > 0 ? ` ${stocked.length}` : ""}`}
        />
      </div>

      {view === "current" ? (
        <CurrentView
          pins={pins}
          snapshot={snapshot}
          isStale={isStale}
          hasFresh={hasFresh}
          loading={loading}
          error={error}
          organise={organise}
          stockedIds={stockedIds}
          customerIdByName={customerIdByName}
        />
      ) : (
        <StockView
          stocked={stocked}
          stockedIds={stockedIds}
          customerIdByName={customerIdByName}
        />
      )}
    </div>
  );
}

function CurrentView({
  pins,
  snapshot,
  isStale,
  hasFresh,
  loading,
  error,
  organise,
  stockedIds,
  customerIdByName,
}: {
  pins: PinnedMessage[];
  snapshot: LearningsSnapshot | null;
  isStale: boolean;
  hasFresh: boolean;
  loading: boolean;
  error: boolean;
  organise: () => void;
  stockedIds: Set<string>;
  customerIdByName: Map<string, string>;
}) {
  if (pins.length === 0) {
    return (
      <p className="text-center text-body-sm text-ink-mute py-6">
        保存がないため、今回整理できる学びはありません。
        <br />
        過去にストックした学びは「ストック」タブで確認できます。
      </p>
    );
  }

  return (
    <>
      {/* Intro / action header */}
      <div className="rounded-card border border-gold/20 bg-champagne-soft/30 px-4 py-3">
        <div className="flex items-center gap-2 mb-1">
          <Sparkles size={14} className="text-gold-deep" />
          <span className="font-serif text-[15px] font-medium text-ink">
            {SAKURA_MAMA_DISPLAY_NAME}が学びを整理
          </span>
        </div>
        <p className="text-body-sm text-ink-soft leading-relaxed">
          保存した{pins.length}件の会話を、お客様ごとに覚えておくべきことへまとめます。気に入った学びは
          <Bookmark size={11} className="inline-block mx-0.5 -mt-0.5 text-gold-deep" />
          でストックできます。
        </p>
        {(isStale || !snapshot) && (
          <button
            type="button"
            onClick={organise}
            disabled={loading}
            className="mt-2.5 inline-flex items-center gap-1.5 rounded-pill bg-wine-deep text-pearl-light px-4 py-2 text-body-sm font-medium shadow-warm disabled:opacity-60"
          >
            {loading ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Sparkles size={14} />
            )}
            {snapshot ? "学びを更新する" : "学びを整理する"}
          </button>
        )}
        {isStale && !loading && (
          <p className="mt-1.5 text-[11px] text-gold-deep">
保存が更新されています。整理し直すと最新になります。
          </p>
        )}
        {error && (
          <p className="mt-1.5 text-[11px] text-wine-deep">
            整理に失敗しました。もう一度お試しください。
          </p>
        )}
      </div>

      {/* Learning cards, grouped by customer */}
      {snapshot && snapshot.learnings.length > 0 && (
        <>
          <GroupedLearnings
            items={snapshot.learnings}
            stockedIds={stockedIds}
            customerIdByName={customerIdByName}
          />
          <div className="flex items-center justify-between pt-1">
            <span className="text-[10px] text-ink-mute">
              {formatGeneratedAt(snapshot.generatedAt)}に整理
            </span>
            {hasFresh && (
              <button
                type="button"
                onClick={organise}
                disabled={loading}
                className="inline-flex items-center gap-1 text-[11px] text-gold-deep hover:underline disabled:opacity-60"
              >
                {loading ? (
                  <Loader2 size={11} className="animate-spin" />
                ) : (
                  <RefreshCw size={11} />
                )}
                整理し直す
              </button>
            )}
          </div>
        </>
      )}

      {snapshot && snapshot.learnings.length === 0 && (
        <p className="text-center text-body-sm text-ink-mute py-6">
          まだ学びを抽出できませんでした。メモを足してから整理し直してみてください。
        </p>
      )}
    </>
  );
}

function StockView({
  stocked,
  stockedIds,
  customerIdByName,
}: {
  stocked: StockedLearning[];
  stockedIds: Set<string>;
  customerIdByName: Map<string, string>;
}) {
  if (stocked.length === 0) {
    return (
      <div className="pt-2">
        <EmptyState
          icon={<Bookmark size={22} />}
          title="ストックはまだありません"
          description="「今回の整理」で気に入った学びのしおりアイコンを押すと、整理し直しても消えずにここへ残ります。"
          tone="amethyst"
        />
      </div>
    );
  }

  return (
    <GroupedLearnings
      items={stocked}
      stockedIds={stockedIds}
      customerIdByName={customerIdByName}
    />
  );
}

/** Renders learnings grouped into per-customer sections (全般 last). */
function GroupedLearnings({
  items,
  stockedIds,
  customerIdByName,
}: {
  items: Learning[];
  stockedIds: Set<string>;
  customerIdByName: Map<string, string>;
}) {
  const groups = groupByCustomer(items);
  return (
    <>
      {groups.map((g) => (
        <div key={g.customer ?? "__general__"} className="space-y-2">
          <CustomerHeader
            name={g.customer}
            customerId={g.customer ? customerIdByName.get(g.customer) : undefined}
          />
          {g.items.map((l, i) => (
            <LearningCard
              key={`${learningKey(l)}-${i}`}
              learning={l}
              stocked={stockedIds.has(learningKey(l))}
              onToggleStock={() => toggleStock(l)}
            />
          ))}
        </div>
      ))}
    </>
  );
}

function CustomerHeader({
  name,
  customerId,
}: {
  name: string | null;
  customerId?: string;
}) {
  if (name === null) {
    return (
      <div className="flex items-center gap-1.5 pt-1">
        <Sparkles size={12} className="text-gold-deep" />
        <span className="text-label-sm font-medium text-ink-soft tracking-[0.06em]">
          全般
        </span>
      </div>
    );
  }
  const inner = (
    <>
      <User size={13} className="text-wine-deep shrink-0" />
      <span className="font-serif text-[14px] font-medium text-wine-deep tracking-[0.02em]">
        {name}さん
      </span>
      {customerId && <ChevronRight size={13} className="text-ink-mute ml-auto" />}
    </>
  );
  return customerId ? (
    <Link
      href={`/cast/customers/${customerId}`}
      className="flex items-center gap-1.5 pt-1 hover:underline"
    >
      {inner}
    </Link>
  ) : (
    <div className="flex items-center gap-1.5 pt-1">{inner}</div>
  );
}

function LearningCard({
  learning,
  stocked,
  onToggleStock,
}: {
  learning: Learning;
  stocked: boolean;
  onToggleStock: () => void;
}) {
  return (
    <div className="rounded-card border border-ink/[0.08] bg-pearl-light shadow-soft px-4 py-3">
      <div className="flex items-start justify-between gap-2">
        <span className="inline-block rounded-pill bg-success/10 border border-success/20 px-2 py-0.5 text-[10px] font-medium text-success tracking-[0.04em] mb-1.5">
          {learning.category}
        </span>
        <button
          type="button"
          onClick={onToggleStock}
          className={
            "w-7 h-7 -mt-1 -mr-1 rounded-full flex items-center justify-center shrink-0 transition-colors " +
            (stocked
              ? "text-gold-deep hover:bg-champagne-soft/50"
              : "text-ink-mute hover:bg-pearl-soft hover:text-gold-deep")
          }
          aria-label={stocked ? "ストックから外す" : "ストックに追加"}
          aria-pressed={stocked}
          title={stocked ? "ストックから外す" : "ストックに追加"}
        >
          {stocked ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
        </button>
      </div>
      <h3 className="font-serif text-[15px] leading-snug font-medium text-ink mb-1">
        {learning.title}
      </h3>
      <p className="text-body-sm text-ink-soft leading-relaxed whitespace-pre-wrap break-words">
        {learning.body}
      </p>
    </div>
  );
}

function SubTab({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        "flex-1 rounded-pill px-3 py-1.5 text-label-sm font-medium tracking-[0.04em] transition-colors " +
        (active
          ? "bg-pearl-light text-wine-deep shadow-soft"
          : "text-ink-mute hover:text-ink-soft")
      }
    >
      {label}
    </button>
  );
}

/** Group learnings by customer, keeping first-seen order with 全般 pinned last. */
function groupByCustomer<T extends Learning>(
  items: T[],
): { customer: string | null; items: T[] }[] {
  const map = new Map<string, T[]>();
  const order: string[] = [];
  for (const it of items) {
    const key = it.customer && it.customer !== "全般" ? it.customer : "";
    if (!map.has(key)) {
      map.set(key, []);
      order.push(key);
    }
    map.get(key)!.push(it);
  }
  return order
    .map((k) => ({ customer: k === "" ? null : k, items: map.get(k)! }))
    .sort((a, b) => (a.customer === null ? 1 : b.customer === null ? -1 : 0));
}

function formatGeneratedAt(iso: string): string {
  const d = new Date(iso);
  return `${d.getMonth() + 1}/${d.getDate()} ${d.getHours()}:${String(
    d.getMinutes(),
  ).padStart(2, "0")}`;
}
