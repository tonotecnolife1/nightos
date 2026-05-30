import Link from "next/link";
import { History } from "lucide-react";
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
        right={
          <Link
            href="/cast/ruri-mama/history"
            className="flex flex-col items-center gap-0.5 px-1.5 py-1 rounded-lg hover:bg-pearl-warm/60 text-ink-soft"
            aria-label="相談履歴"
          >
            <History size={16} />
            <span className="text-[9px] leading-none opacity-80">履歴</span>
          </Link>
        }
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
