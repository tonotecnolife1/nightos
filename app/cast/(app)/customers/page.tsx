import Link from "next/link";
import { UserPlus } from "lucide-react";
import { Card } from "@/components/nightos/card";
import { MoreMenu } from "@/components/nightos/more-menu";
import { PageHeader } from "@/components/nightos/page-header";
import { StatCard } from "@/components/nightos/stat-card";
import { CustomerPageShell } from "@/features/cast-customers/components/customer-page-shell";
import { ProfileProposalInbox } from "@/features/customer-card/components/profile-proposal-inbox";
import {
  getAllCasts,
  getCustomersForCast,
} from "@/lib/nightos/supabase-queries";
import { getCurrentCastId, getCurrentVenueType } from "@/lib/nightos/auth";
import { calculateFunnelStats } from "@/lib/nightos/referral-tree";

export const dynamic = "force-dynamic";

interface Props {
  searchParams: { scope?: string };
}

export default async function CastCustomerListPage({ searchParams }: Props) {
  const castId = await getCurrentCastId();
  // 登録直後の遷移などで初期表示するビュー（担当 / ヘルプ）を URL から受ける。
  const initialScope =
    searchParams.scope === "help"
      ? "help"
      : searchParams.scope === "tantou"
        ? "tantou"
        : undefined;
  const [allCasts, allCustomers, venueType] = await Promise.all([
    getAllCasts(),
    getCustomersForCast(castId),
    getCurrentVenueType(),
  ]);
  const isCabaret = venueType === "cabaret";

  // 担当（メイン）= 自分が担当の顧客を表示する。
  // 自分が担当 (manager_cast_id === castId) の顧客に加えて、
  // 自分の顧客 (cast_id === castId) で manager_cast_id が未設定のものも含める。
  // （新規登録直後に manager_cast_id が埋まらないケースで一覧から消える事故を防ぐ）。
  // 他キャストが担当 (manager_cast_id が別人) のヘルプ顧客のみ除外する。
  const myCustomers = allCustomers.filter(
    (c) =>
      c.manager_cast_id === castId ||
      (c.cast_id === castId && !c.manager_cast_id),
  );
  // Help customers: assigned to this cast but managed by someone else
  const helpCustomers = allCustomers.filter(
    (c) => c.cast_id === castId && c.manager_cast_id && c.manager_cast_id !== castId,
  );
  const customers = isCabaret ? allCustomers : myCustomers;

  // 担当が 0 人でもヘルプ顧客がいればリスト（ヘルプビュー）を表示する。
  // 例: ヘルプとして初登録した直後に空状態へ落ちて顧客が見えないのを防ぐ。
  const hasVisibleCustomers =
    customers.length > 0 || (!isCabaret && helpCustomers.length > 0);

  const funnel = calculateFunnelStats(customers);

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="お客様リスト"
        subtitle={`${customers.length}人のお客様`}
        showBack
        right={<MoreMenu />}
      />
      <div className="px-5 pt-3 pb-6 space-y-5">
        {/* 承認待ちの変更提案（ヘルプからの提案に気づく導線） */}
        <ProfileProposalInbox castId={castId} />

        {/* Funnel snapshot */}
        <div className="grid grid-cols-2 gap-2.5">
          <StatCard
            label={isCabaret ? "フリー" : "担当"}
            value={funnel.assigned}
            unit="人"
            tone="rose"
          />
          <StatCard
            label="ヘルプ"
            value={helpCustomers.length}
            unit="人"
            tone="amethyst"
          />
        </div>

        {!hasVisibleCustomers ? (
          <Card className="p-8 text-center space-y-3">
            <p className="text-body-md text-ink">
              まだ顧客が登録されていません
            </p>
            <p className="text-body-sm text-ink-soft">
              担当のお客様を追加すると、ここから来店履歴やボトル、メモを管理できます。
            </p>
            <Link
              href="/cast/customers/new"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-pill bg-wine-deep text-pearl-light text-body-sm font-semibold tracking-[0.04em] shadow-luxe"
            >
              <UserPlus size={14} />
              最初の顧客を追加
            </Link>
          </Card>
        ) : (
          <CustomerPageShell
            castId={castId}
            allCasts={allCasts}
            allMyCustomers={customers}
            helpCustomers={!isCabaret ? helpCustomers : []}
            initialScope={initialScope}
          />
        )}
      </div>
    </div>
  );
}
