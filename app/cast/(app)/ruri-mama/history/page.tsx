import { MoreMenu } from "@/components/nightos/more-menu";
import { PageHeader } from "@/components/nightos/page-header";
import { ChatHistoryView } from "@/features/ruri-mama/components/chat-history-view";

export default function ChatHistoryPage() {
  return (
    <div className="animate-fade-in">
      <PageHeader
        title="相談履歴"
        subtitle="過去のさくらママとのやりとり"
        showBack
        backHref="/cast/ruri-mama"
        // スケジュールアイコンは出さず、☰ メニューのみ表示する
        right={<MoreMenu />}
      />
      <ChatHistoryView />
    </div>
  );
}
