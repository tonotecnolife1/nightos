import { PageHeader } from "@/components/nightos/page-header";
import { AddPageClient } from "@/features/qr-contact/components/add-page-client";
import { CONTACT_QUERY_KEY } from "@/features/qr-contact/lib/contact-payload";

export const dynamic = "force-dynamic";

/**
 * QR の URL を直接開いたときの追加ページ (/cast/connect/add?c=...)。
 * スマホ標準カメラで読み取られたケースをカバーする。
 */
export default function ConnectAddPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const raw = searchParams[CONTACT_QUERY_KEY];
  const token = Array.isArray(raw) ? raw[0] : raw;

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="連絡先を追加"
        showBack
        backHref="/cast/connect"
      />
      <div className="px-4 pt-3 pb-8">
        <AddPageClient token={token} />
      </div>
    </div>
  );
}
