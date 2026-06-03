import { PageHeader } from "@/components/nightos/page-header";
import { TemplateWorkspace } from "@/features/templates/components/template-workspace";

export default function TemplatesPage() {
  return (
    <div className="animate-fade-in">
      <PageHeader
        title="メッセージテンプレート"
        subtitle="よく使う文面を登録・編集"
        showBack
      />
      <div className="px-5 pt-4 pb-6">
        <TemplateWorkspace />
      </div>
    </div>
  );
}
