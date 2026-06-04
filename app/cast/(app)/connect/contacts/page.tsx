import { QrCode } from "lucide-react";
import Link from "next/link";
import { PageHeader } from "@/components/nightos/page-header";
import { ContactList } from "@/features/qr-contact/components/contact-list";

export const dynamic = "force-dynamic";

/**
 * 友達一覧 (/cast/connect/contacts)。
 * QR で交換した連絡先をまとめて閲覧・検索する。
 */
export default function FriendsPage() {
  return (
    <div className="animate-fade-in">
      <PageHeader
        title="友達一覧"
        subtitle="QRで交換した連絡先"
        showBack
        backHref="/cast/connect"
        right={
          <Link
            href="/cast/connect"
            aria-label="QRで友達を追加"
            className="w-9 h-9 rounded-full flex items-center justify-center bg-pearl-warm/70 hover:bg-pearl-warm text-ink-soft transition"
          >
            <QrCode size={17} />
          </Link>
        }
      />
      <div className="px-4 pt-3 pb-8">
        <ContactList searchable />
      </div>
    </div>
  );
}
