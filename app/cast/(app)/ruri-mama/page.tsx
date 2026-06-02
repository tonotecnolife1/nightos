import { MoreMenu } from "@/components/nightos/more-menu";
import { PageHeader } from "@/components/nightos/page-header";
import { ChatWindow } from "@/features/ruri-mama/components/chat-window";
import { ChatLimitBanner } from "@/features/ruri-mama/components/chat-limit-banner";
import { getCurrentCast } from "@/lib/nightos/auth";
import { CURRENT_CAST_ID } from "@/lib/nightos/constants";
import { getCustomersForCast } from "@/lib/nightos/supabase-queries";

interface Props {
  searchParams: { customerId?: string; compose?: string };
}

export default async function RuriMamaPage({ searchParams }: Props) {
  const cast = await getCurrentCast();
  const castId = cast?.id ?? CURRENT_CAST_ID;
  const isStubMode = !process.env.ANTHROPIC_API_KEY;

  const customers = await getCustomersForCast(castId);
  const helpCastNames = {};

  return (
    <div className="flex flex-col flex-1 min-h-0 animate-fade-in">
      <PageHeader
        title="さくらママ"
        subtitle="銀座30年の経験者"
        showBack
        tone="ruri"
        // 相談履歴サイドバー (z-50) より上に重ねる。
        // PageHeader は sticky z-50 で stacking context を作るため、☰ メニューの
        // 吹き出し (z-[70]) はその内側に閉じ込められ、後から DOM に並ぶ相談履歴
        // (z-50) に覆われてしまう。ヘッダー自体を z-[60] へ引き上げて、☰ が常に
        // 最前面に出るようにする。
        className="z-[60]"
        // 相談履歴は画面内の左上トグル（サイドバー）から開ける。
        // スケジュールアイコンは出さず ☰ メニューのみ表示する。
        right={<MoreMenu tone="ruri" />}
      />
      <ChatLimitBanner />
      <ChatWindow
        customers={customers}
        helpCastNames={helpCastNames}
        initialCustomerId={searchParams.customerId}
        initialCompose={searchParams.compose === "1"}
        initialIsStubMode={isStubMode}
      />
    </div>
  );
}
