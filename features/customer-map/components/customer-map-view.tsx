"use client";

import { createContext, useContext, useMemo, useState } from "react";
import Link from "next/link";
import { ChevronDown, ChevronRight, Crown, HandHelping, Star, User, Users } from "lucide-react";
import type { Cast, Customer, Visit } from "@/types/nightos";
import {
  buildCastBasedTree,
  buildReferralTree,
  countReferrals,
} from "@/lib/nightos/referral-tree";
import { cn, formatCustomerName } from "@/lib/utils";
import { FunnelBadge } from "@/features/customer-card/components/funnel-badge";
import { EmptyState } from "@/components/nightos/empty-state";

interface Props {
  customers: Customer[];
  casts: Cast[];
  mode: "customer" | "cast";
  /** ヘルプ（cast モード）の多対多バケット導出に使う来店履歴 */
  visits?: Visit[];
  /** 星をつけた顧客の id 集合（指定時のみ星 UI を表示） */
  starredIds?: Set<string>;
  /** 星のオン/オフ切替。未指定なら星ボタン・ピン留め帯を出さない */
  onToggleStar?: (customerId: string) => void;
}

// 星の状態とハンドラをツリーの各階層へ配るためのコンテキスト。
// （prop drilling を避けるための内部利用）
const StarContext = createContext<{
  starred: Set<string>;
  toggle: (id: string) => void;
} | null>(null);

function StarButton({ id }: { id: string }) {
  const ctx = useContext(StarContext);
  if (!ctx) return null;
  const active = ctx.starred.has(id);
  return (
    <button
      type="button"
      aria-label={active ? "星を外す" : "星をつける"}
      aria-pressed={active}
      onClick={(e) => {
        // 親が Link のためデフォルト遷移と伝播を止める
        e.preventDefault();
        e.stopPropagation();
        ctx.toggle(id);
      }}
      className="shrink-0 w-7 h-7 -ml-1 flex items-center justify-center rounded-full hover:bg-pearl-soft active:scale-90 transition"
    >
      <Star
        size={14}
        className={cn(
          active ? "fill-current text-gold-deep" : "text-ink-mute",
        )}
      />
    </button>
  );
}

/** 星をつけた顧客を先頭へ。元の並び順は安定的に保つ。 */
function sortStarredFirst<T>(
  items: T[],
  getId: (item: T) => string,
  starred: Set<string> | undefined,
): T[] {
  if (!starred || starred.size === 0) return items;
  return items
    .map((item, idx) => ({ item, idx }))
    .sort((a, b) => {
      const sa = starred.has(getId(a.item)) ? 0 : 1;
      const sb = starred.has(getId(b.item)) ? 0 : 1;
      return sa - sb || a.idx - b.idx;
    })
    .map((x) => x.item);
}

export function CustomerMapView({
  customers,
  casts,
  mode,
  visits,
  starredIds,
  onToggleStar,
}: Props) {
  const ctxValue = useMemo(
    () =>
      onToggleStar
        ? { starred: starredIds ?? new Set<string>(), toggle: onToggleStar }
        : null,
    [starredIds, onToggleStar],
  );

  if (customers.length === 0) {
    return (
      <EmptyState
        icon={<User size={22} />}
        title="表示できるお客様がいません"
        description="お客様を登録すると相関図が描かれます"
        tone="amethyst"
      />
    );
  }

  return (
    <StarContext.Provider value={ctxValue}>
      {mode === "customer" ? (
        <CustomerBasedMap customers={customers} casts={casts} />
      ) : (
        <CastBasedMap customers={customers} casts={casts} visits={visits} />
      )}
    </StarContext.Provider>
  );
}

// ═══════════════ Customer-based (referral tree) ═══════════════
// Layout: 紹介元顧客ごとに上から縦に階層で並べる。
//         各ツリー内では親の下に子が字下げされて続く。

function CustomerBasedMap({
  customers,
  casts,
}: {
  customers: Customer[];
  casts: Cast[];
}) {
  const tree = buildReferralTree({ customers, casts });
  const castById = new Map(casts.map((c) => [c.id, c]));
  const starCtx = useContext(StarContext);
  const sortedTree = sortStarredFirst(
    tree,
    (node) => node.customer.id,
    starCtx?.starred,
  );

  return (
    <div className="space-y-3">
      <div className="space-y-4">
        {sortedTree.map((node) => (
          <ReferralTree
            key={node.customer.id}
            node={node}
            castById={castById}
          />
        ))}
      </div>
    </div>
  );
}

function ReferralTree({
  node,
  castById,
}: {
  node: import("@/types/nightos").CustomerReferralNode;
  castById: Map<string, Cast>;
}) {
  const refCount = countReferrals(node);
  const [expanded, setExpanded] = useState(true);
  const hasChildren = node.children.length > 0;

  return (
    <div className="flex flex-col gap-2">
      <ReferralNodeCard
        node={node}
        castById={castById}
        isRoot
        rootRefCount={refCount}
      />
      {hasChildren && (
        <ReferralToggle
          expanded={expanded}
          onToggle={() => setExpanded((v) => !v)}
          childCount={node.children.length}
          tone="strong"
        />
      )}
      {hasChildren && expanded && (
        <div className="ml-3 mt-1">
          {node.children.map((child, idx) => (
            <TreeChildWrapper
              key={child.customer.id}
              isLast={idx === node.children.length - 1}
              lineTone="strong"
            >
              <RecursiveChild node={child} castById={castById} />
            </TreeChildWrapper>
          ))}
        </div>
      )}
    </div>
  );
}

function RecursiveChild({
  node,
  castById,
}: {
  node: import("@/types/nightos").CustomerReferralNode;
  castById: Map<string, Cast>;
}) {
  const [expanded, setExpanded] = useState(true);
  const hasChildren = node.children.length > 0;

  return (
    <div className="flex flex-col gap-2">
      <ReferralNodeCard node={node} castById={castById} />
      {hasChildren && (
        <ReferralToggle
          expanded={expanded}
          onToggle={() => setExpanded((v) => !v)}
          childCount={node.children.length}
          tone="soft"
        />
      )}
      {hasChildren && expanded && (
        <div className="ml-3 mt-1">
          {node.children.map((child, idx) => (
            <TreeChildWrapper
              key={child.customer.id}
              isLast={idx === node.children.length - 1}
              lineTone="soft"
            >
              <RecursiveChild node={child} castById={castById} />
            </TreeChildWrapper>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * 紹介チェーンを折りたたむトグル。展開時は「紹介を折りたたむ」、
 * 折りたたみ時は「紹介を表示 (N人)」のラベルに切り替わる。
 */
function ReferralToggle({
  expanded,
  onToggle,
  childCount,
  tone,
}: {
  expanded: boolean;
  onToggle: () => void;
  childCount: number;
  tone: "strong" | "soft";
}) {
  const toneClass =
    tone === "strong"
      ? "bg-champagne-soft/60/40 border-gold/30 text-gold-deep"
      : "bg-pearl-soft border-pearl-soft text-ink-soft";
  return (
    <button
      type="button"
      onClick={onToggle}
      className={cn(
        "self-start ml-3 inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-badge border active:scale-[0.97] transition-transform",
        toneClass,
      )}
    >
      {expanded ? (
        <>
          <ChevronDown size={11} />
          お連れ様を折りたたむ
        </>
      ) : (
        <>
          <ChevronRight size={11} />
          お連れ様を表示（{childCount}人）
        </>
      )}
    </button>
  );
}

/**
 * ツリーの子要素を、親からの L字ライン（縦線＋横線のエルボー）で繋ぐラッパ。
 * 最後の子だけ縦線をエルボーの位置で止めることで、兄弟関係が視覚的に分かる。
 */
function TreeChildWrapper({
  children,
  isLast,
  lineTone = "soft",
}: {
  children: React.ReactNode;
  isLast: boolean;
  lineTone?: "strong" | "soft";
}) {
  const lineColor =
    lineTone === "strong"
      ? "bg-gold/30"
      : "bg-gold/30/60";
  return (
    <div className="relative pl-6 mt-2 first:mt-0">
      {/* Horizontal elbow (card center y) */}
      <div
        className={cn("absolute left-0 top-4 w-6 h-px", lineColor)}
      />
      {/* Vertical trunk. Last child: stop at elbow. Others: extend into the 8px gap below. */}
      <div
        className={cn(
          "absolute left-0 top-0 w-px",
          lineColor,
          isLast ? "h-4" : "bottom-[-8px]",
        )}
      />
      {children}
    </div>
  );
}

function ReferralNodeCard({
  node,
  castById,
  isRoot,
  rootRefCount,
}: {
  node: import("@/types/nightos").CustomerReferralNode;
  castById: Map<string, Cast>;
  isRoot?: boolean;
  /** isRoot=true の時だけ使用: 紹介した人数 */
  rootRefCount?: number;
}) {
  const manager = node.customer.manager_cast_id
    ? castById.get(node.customer.manager_cast_id)
    : null;
  const cast = castById.get(node.customer.cast_id);

  return (
    <Link
      href={`/cast/customers/${node.customer.id}`}
      className={cn(
        "block rounded-card bg-pearl-warm border shadow-soft px-3 py-2 active:scale-[0.99] transition-transform",
        isRoot ? "border-gold/30" : "border-pearl-soft",
      )}
    >
      {/* 1行目: 星 + 名前 + ファネル状態バッジ（担当ありは表示しない） [余白] 紹介元ラベル */}
      <div className="flex items-center gap-2 min-w-0">
        <StarButton id={node.customer.id} />
        <span className="text-body-sm font-semibold text-ink truncate">
          {formatCustomerName(node.customer.name)}
        </span>
        {(node.customer.funnel_stage ?? "store_only") !== "assigned" && (
          <FunnelBadge
            stage={node.customer.funnel_stage ?? "store_only"}
          />
        )}
        {isRoot && (
          <span className="ml-auto flex items-center gap-1 text-[10px] text-gold-deep font-medium shrink-0 bg-champagne-soft/60/40 border border-gold/30 rounded-badge px-1.5 py-0.5">
            <Crown size={10} />
            お連れ様合計{rootRefCount ?? 0}人
          </span>
        )}
      </div>
      {/* 2行目: 管理：X、担当：Y、職業 */}
      <div className="text-[11px] text-ink-soft mt-1 truncate">
        <span>管理：</span>
        <span className="text-ink font-medium">{manager?.name ?? "—"}</span>
        <span className="text-ink-mute">、</span>
        <span>担当：</span>
        <span className="text-ink font-medium">{cast?.name ?? "—"}</span>
        {node.customer.job && (
          <>
            <span className="text-ink-mute">、</span>
            <span className="text-ink-mute">{node.customer.job}</span>
          </>
        )}
      </div>
    </Link>
  );
}

// ═══════════════ Cast-based (manager → cast → customers) ═══════════════
// Layout: 管理者ごとに上から縦に階層で並べる。
//         管理者ブロック内で 担当キャスト → 顧客 と更に字下げ。

function CastBasedMap({
  customers,
  casts,
  visits,
}: {
  customers: Customer[];
  casts: Cast[];
  visits?: Visit[];
}) {
  const tree = buildCastBasedTree({ customers, casts, visits });

  return (
    <div className="space-y-3">
      {tree.map((group, i) => (
        <ManagerBlock
          key={(group.manager?.id ?? "none") + i}
          group={group}
        />
      ))}
    </div>
  );
}

function ManagerBlock({
  group,
}: {
  group: import("@/lib/nightos/referral-tree").CastBasedNode;
}) {
  const managerLabel = group.manager
    ? `${group.manager.name}さん`
    : "管理者未割り当て";

  return (
    <div className="flex flex-col gap-2 rounded-card bg-champagne-soft/60/20 border border-gold/30 p-2.5">
      <div className="flex items-center gap-1.5">
        <Crown size={14} className="text-gold-deep shrink-0" />
        <span className="text-body-sm font-semibold text-ink flex-1 truncate">
          {managerLabel}
        </span>
        <span className="text-[10px] text-ink-mute shrink-0">
          {group.totalCustomers}人
        </span>
      </div>

      {/* Manager → Cast connectors */}
      <div className="ml-2 mt-1">
        {group.byCast.map((bucket, idx) => (
          <TreeChildWrapper
            key={(bucket.cast?.id ?? "none") + idx}
            isLast={idx === group.byCast.length - 1}
            lineTone="strong"
          >
            <CastBucket bucket={bucket} />
          </TreeChildWrapper>
        ))}
      </div>
    </div>
  );
}

function CastBucket({
  bucket,
}: {
  bucket: import("@/lib/nightos/referral-tree").CastBucketNode;
}) {
  const [expanded, setExpanded] = useState(true);
  const starCtx = useContext(StarContext);
  const isHelp = bucket.kind === "help";
  const castLabel = bucket.cast
    ? `${bucket.cast.name}さん${isHelp ? "ヘルプ" : "担当"}`
    : "担当未割り当て";
  const sortedCustomers = sortStarredFirst(
    bucket.customers,
    (c) => c.id,
    starCtx?.starred,
  );

  return (
    <div
      className={cn(
        "rounded-btn border overflow-hidden",
        isHelp
          ? "bg-champagne/20 border-champagne-dark/30"
          : "bg-pearl-warm border-pearl-soft",
      )}
    >
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className={cn(
          "w-full flex items-center gap-1.5 px-2.5 py-1.5 text-left",
          isHelp ? "hover:bg-champagne/30" : "hover:bg-pearl-soft",
        )}
      >
        {isHelp ? (
          <HandHelping size={11} className="text-champagne-dark shrink-0" />
        ) : (
          <Users size={11} className="text-wine-deep shrink-0" />
        )}
        <span className="text-[11px] font-medium text-ink flex-1 truncate">
          {castLabel}
        </span>
        <span className="text-[9px] text-ink-mute shrink-0">
          {bucket.customers.length}
        </span>
        {expanded ? (
          <ChevronDown size={10} className="text-ink-mute shrink-0" />
        ) : (
          <ChevronRight size={10} className="text-ink-mute shrink-0" />
        )}
      </button>

      {/* Cast → Customer connectors */}
      {expanded && (
        <div className="pl-2 pr-1.5 pb-1.5 pt-1">
          {sortedCustomers.map((c, idx) => (
            <TreeChildWrapper
              key={c.id}
              isLast={idx === sortedCustomers.length - 1}
              lineTone="soft"
            >
              <CustomerLeaf customer={c} />
            </TreeChildWrapper>
          ))}
        </div>
      )}
    </div>
  );
}

function CustomerLeaf({ customer }: { customer: Customer }) {
  const categoryLabel =
    customer.category === "vip"
      ? "VIP"
      : customer.category === "new"
        ? "新規"
        : "常連";
  const categoryStyle =
    customer.category === "vip"
      ? "bg-champagne-soft/60 text-wine-deep border-gold/30"
      : customer.category === "new"
        ? "bg-champagne-soft/60/50 text-gold-deep border-gold/30"
        : "bg-pearl-soft text-ink-soft border-pearl-soft";
  return (
    <Link
      href={`/cast/customers/${customer.id}`}
      className="flex items-center gap-2 px-2 py-1.5 rounded-btn hover:bg-pearl-soft"
    >
      <StarButton id={customer.id} />
      <span className="text-[12px] text-ink flex-1 truncate">
        {formatCustomerName(customer.name)}
      </span>
      {customer.job && (
        <span className="text-[10px] text-ink-mute truncate max-w-[40%]">
          {customer.job}
        </span>
      )}
      <span
        className={cn(
          "text-[10px] font-medium shrink-0 border rounded-badge px-1.5 py-0.5",
          categoryStyle,
        )}
      >
        {categoryLabel}
      </span>
    </Link>
  );
}
