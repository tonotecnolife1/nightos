import { PageHeader } from "@/components/nightos/page-header";
import { ContactDetail } from "@/features/qr-contact/components/contact-detail";

export const dynamic = "force-dynamic";

/**
 * 友達詳細 (/cast/connect/contacts/[id])。
 * 連絡先は localStorage 管理のためクライアントで id を解決する。
 */
export default function FriendDetailPage({
  params,
}: {
  params: { id: string };
}) {
  return (
    <div className="animate-fade-in">
      <PageHeader
        title="友達"
        showBack
        backHref="/cast/connect/contacts"
      />
      <div className="px-4 pt-3 pb-8">
        <ContactDetail contactId={decodeURIComponent(params.id)} />
      </div>
    </div>
  );
}
