import { MoreMenu } from "@/components/nightos/more-menu";
import { PageHeader } from "@/components/nightos/page-header";
import { ChatWindow } from "@/features/ruri-mama/components/chat-window";
import { ChatLimitBanner } from "@/features/ruri-mama/components/chat-limit-banner";
import { getCurrentCast } from "@/lib/nightos/auth";
import { CURRENT_CAST_ID } from "@/lib/nightos/constants";
import { getCustomersForCast } from "@/lib/nightos/supabase-queries";

interface Props {
  searchParams: { customerId?: string };
}

export default async function RuriMamaPage({ searchParams }: Props) {
  const cast = await getCurrentCast();
  const castId = cast?.id ?? CURRENT_CAST_ID;
  const isStubMode = !process.env.ANTHROPIC_API_KEY;

  const customers = await getCustomersForCast(castId);
  const helpCastNames = {};

  return (
    <div className="flex flex-col h-dvh animate-fade-in">
      <PageHeader
        title="さくらママ"
        subtitle="銀座30年の経験者"
        showBack
        tone="ruri"
        // 相談履歴は画面内の左上トグル（サイドバー）から開ける。
        // スケジュールアイコンは出さず ☰ メニューのみ表示する。
        right={<MoreMenu tone="ruri" />}
      />
      <ChatLimitBanner />
      <ChatWindow
        customers={customers}
        helpCastNames={helpCastNames}
        initialCustomerId={searchParams.customerId}
        initialIsStubMode={isStubMode}
      />
    </div>
  );
}
