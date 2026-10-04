import type {
  Bottle,
  CastMemo,
  Customer,
  FollowReason,
  FollowTarget,
  Visit,
} from "@/types/nightos";

interface SelectArgs {
  customers: Customer[];
  visits: Visit[];
  bottles: Bottle[];
  memos: CastMemo[];
  today: Date;
}

// ─────────────────────────────────────────────────────────────
// Pure, deterministic follow-target selection.
// Rules from SPEC.md:
//   (a) 来店間隔空き: daysSinceLastVisit > avgInterval * 1.5
//   (b) 誕生日        : birthday within the next 14 days
//   (c) 指名化チャンス : visitCount <= 3 && daysSinceLastVisit <= 14 && !isDesignated
// If a customer matches multiple rules, the higher-priority reason wins:
//   birthday > interval > nomination_chance
// ─────────────────────────────────────────────────────────────

const DAY_MS = 24 * 60 * 60 * 1000;

// ボトルキープ枠はウイスキー / 焼酎のみが対象。
// シャンパン・スパークリング・ワイン・コニャック(ブランデー) は
// グラス売り (顧客の favorite_drink) であってボトルキープではないため、
// 連絡リストのボトルキープ表示からは除外する。
// brand は自由入力テキストなので「ボトルキープにならない種別」を
// キーワードで弾く denylist 方式にしている（未知のウイスキー/焼酎銘柄を
// 誤って隠さないため、allowlist ではなく denylist）。
const NON_BOTTLE_KEEP_PATTERNS: RegExp[] = [
  // シャンパン / スパークリング
  /シャンパン|スパークリング|champagne|sparkling/i,
  /ドンペリ|モエ|ヴーヴ|クリコ|クリュッグ|シャンドン|ローラン[ ・]?ペリエ|テタンジェ|ペリエ[ ・]?ジュエ|アルマン|ランソン|ニコラ[ ・]?フィアット/i,
  /dom[ ・]?p[eé]rignon|mo[eë]t|veuve|krug|taittinger|perrier|armand|lanson/i,
  // ワイン
  /ワイン|wine|ロマネ|ブルゴーニュ|ボルドー|シャブリ|オーパス[ ・]?ワン/i,
  // コニャック / ブランデー
  /コニャック|ブランデー|cognac|brandy|レミー[ ・]?マルタン|ヘネシー|カミュ|マーテル|クルボアジェ/i,
  /r[eé]my[ ・]?martin|hennessy|camus|martell|courvoisier/i,
];

/**
 * ボトルキープ枠に表示してよい銘柄か (ウイスキー / 焼酎のみ true)。
 * シャンパン・ワイン・コニャック等は false。
 */
export function isBottleKeepBrand(brand: string): boolean {
  return !NON_BOTTLE_KEEP_PATTERNS.some((re) => re.test(brand));
}

export function selectFollowTargets(args: SelectArgs): FollowTarget[] {
  const { customers, visits, bottles, memos, today } = args;
  const out: FollowTarget[] = [];

  // ボトルキープ枠の対象 (ウイスキー / 焼酎) のみに絞る
  const keepBottles = bottles.filter((b) => isBottleKeepBrand(b.brand));

  for (const customer of customers) {
    const myVisits = visits
      .filter((v) => v.customer_id === customer.id)
      .sort(
        (a, b) =>
          new Date(b.visited_at).getTime() - new Date(a.visited_at).getTime(),
      );
    const visitCount = myVisits.length;
    const latest = myVisits[0];
    if (!latest) continue;

    const daysSinceLastVisit = Math.floor(
      (today.getTime() - new Date(latest.visited_at).getTime()) / DAY_MS,
    );
    const avgInterval = computeAverageInterval(myVisits);
    const isNominated = myVisits.some((v) => v.is_nominated);

    const memo = memos.find((m) => m.customer_id === customer.id);
    const bottle =
      keepBottles.find((b) => b.customer_id === customer.id && b.remaining_glasses > 0) ??
      keepBottles.find((b) => b.customer_id === customer.id);

    // Rule (b): birthday within next 14 days
    const birthdayInfo = upcomingBirthday(customer.birthday, today);
    if (birthdayInfo.isUpcoming) {
      out.push({
        customer,
        reason: "birthday",
        reasonLabel: "もうすぐ誕生日🎂",
        reasonDetail: `${birthdayInfo.monthDay}（あと${birthdayInfo.daysUntil}日）`,
        bottle,
        lastTopic: memo?.last_topic ?? null,
        daysSinceLastVisit,
        visitCount,
      });
      continue;
    }

    // Rule (a): interval gap
    if (avgInterval > 0 && daysSinceLastVisit > avgInterval * 1.5) {
      out.push({
        customer,
        reason: "interval",
        reasonLabel: "しばらく来てない",
        reasonDetail: `${daysSinceLastVisit}日ぶり（いつもは${avgInterval}日ごと）`,
        bottle,
        lastTopic: memo?.last_topic ?? null,
        daysSinceLastVisit,
        visitCount,
      });
      continue;
    }

    // Rule (c): nomination chance
    if (visitCount <= 3 && daysSinceLastVisit <= 14 && !isNominated) {
      out.push({
        customer,
        reason: "nomination_chance",
        reasonLabel: "指名をもらえるかも✨",
        reasonDetail: `${visitCount}回目のお客様、${daysSinceLastVisit}日前に来てくれた`,
        bottle,
        lastTopic: memo?.last_topic ?? null,
        daysSinceLastVisit,
        visitCount,
      });
      continue;
    }
  }

  // Sort by priority: birthday > interval > nomination_chance, then by urgency
  const priority: Record<FollowReason, number> = {
    birthday: 0,
    interval: 1,
    nomination_chance: 2,
  };
  out.sort(
    (a, b) =>
      priority[a.reason] - priority[b.reason] ||
      b.daysSinceLastVisit - a.daysSinceLastVisit,
  );
  return out;
}

function computeAverageInterval(
  sortedVisits: Visit[], // DESC by visited_at
): number {
  if (sortedVisits.length < 2) return 0;
  const gaps: number[] = [];
  for (let i = 0; i < sortedVisits.length - 1; i++) {
    const a = new Date(sortedVisits[i].visited_at).getTime();
    const b = new Date(sortedVisits[i + 1].visited_at).getTime();
    gaps.push(Math.floor((a - b) / DAY_MS));
  }
  const sum = gaps.reduce((acc, g) => acc + g, 0);
  return Math.round(sum / gaps.length);
}

function upcomingBirthday(
  birthday: string | null,
  today: Date,
): { isUpcoming: boolean; daysUntil: number; monthDay: string } {
  if (!birthday) return { isUpcoming: false, daysUntil: -1, monthDay: "" };
  const [, mo, da] = birthday.split("-").map((n) => parseInt(n, 10));
  if (!mo || !da) return { isUpcoming: false, daysUntil: -1, monthDay: "" };
  // Next occurrence: this year's M-D, or next year's if already past.
  let next = new Date(today.getFullYear(), mo - 1, da);
  if (next.getTime() < today.getTime()) {
    next = new Date(today.getFullYear() + 1, mo - 1, da);
  }
  const daysUntil = Math.floor(
    (next.getTime() - today.getTime()) / DAY_MS,
  );
  return {
    isUpcoming: daysUntil >= 0 && daysUntil <= 14,
    daysUntil,
    monthDay: `${mo}月${da}日`,
  };
}
