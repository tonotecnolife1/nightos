import { PageHeader } from "@/components/nightos/page-header";
import { BottleForm } from "@/features/bottle-registration/components/bottle-form";
import { getCurrentCastId } from "@/lib/nightos/auth";
import { getCustomersForCast } from "@/lib/nightos/supabase-queries";

interface Props {
  params: { id: string };
}

// キャスト用のボトル登録。店舗用 /store/bottles/new は role ガードで
// キャストがアクセスできない（ホームへ弾かれる）ため、cast レイアウト
// 配下に専用ルートを用意する。登録後は元の顧客詳細へ戻す。
export default async function CastNewBottlePage({ params }: Props) {
  const castId = await getCurrentCastId();
  const customers = await getCustomersForCast(castId);

  return (
    <div className="animate-fade-in">
      <PageHeader title="ボトル登録" subtitle="約30秒で完了" showBack />
      <div className="px-5 pt-4 pb-6">
        <BottleForm
          customers={customers}
          initialCustomerId={params.id}
          returnTo={`/cast/customers/${params.id}`}
        />
      </div>
    </div>
  );
}
