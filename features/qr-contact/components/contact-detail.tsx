"use client";

import { CalendarCheck, Store, Trash2, UserX } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  type ExchangedContact,
  getContact,
  removeContact,
  subscribeContacts,
} from "../lib/contact-store";

interface Props {
  contactId: string;
}

/**
 * 友達 1 人の詳細。プロフィール + 交換日時 + 削除。
 */
export function ContactDetail({ contactId }: Props) {
  const router = useRouter();
  const [contact, setContact] = useState<ExchangedContact | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const refresh = () => setContact(getContact(contactId));
    refresh();
    setLoaded(true);
    return subscribeContacts(refresh);
  }, [contactId]);

  if (!loaded) return null;

  if (!contact) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 rounded-hero border border-dashed border-line-strong bg-pearl-light/50 px-6 py-12 text-center">
        <UserX size={26} className="text-ink-mute" />
        <p className="text-body-sm text-ink-soft">
          この友達は見つかりませんでした。
        </p>
        <Link
          href="/cast/connect/contacts"
          className="h-11 px-6 inline-flex items-center rounded-pill bg-wine-deep text-pearl-light text-label-md font-semibold shadow-warm"
        >
          友達一覧へ戻る
        </Link>
      </div>
    );
  }

  const handleRemove = () => {
    removeContact(contact.id);
    router.replace("/cast/connect/contacts");
  };

  return (
    <div className="space-y-4">
      <div className="rounded-hero border border-ink/[0.08] bg-pearl-light/85 backdrop-blur-md shadow-warm px-6 py-7 flex flex-col items-center text-center">
        <div className="w-20 h-20 rounded-full bg-wine-deep/10 border border-wine-deep/15 flex items-center justify-center">
          <span className="font-serif text-[32px] text-wine-deep">
            {contact.name.trim().charAt(0) || "?"}
          </span>
        </div>
        <p className="mt-3 font-serif text-[22px] font-medium tracking-[0.04em] text-ink">
          {contact.name}
        </p>
        {contact.role && (
          <span className="mt-2 inline-block px-3 py-1 rounded-badge bg-wine-deep/8 text-wine-deep text-label-sm font-medium">
            {contact.role}
          </span>
        )}
      </div>

      <div className="rounded-card border border-ink/[0.08] bg-pearl-light/70 divide-y divide-ink/[0.06]">
        {contact.store && (
          <Row icon={<Store size={15} />} label="店舗">
            {contact.store}
          </Row>
        )}
        <Row icon={<CalendarCheck size={15} />} label="交換日">
          {formatDateTime(contact.exchangedAt)}
        </Row>
      </div>

      {contact.note && (
        <div className="rounded-card border border-ink/[0.08] bg-pearl-light/70 px-4 py-3">
          <p className="text-label-sm text-ink-soft mb-1">ひとこと</p>
          <p className="text-body-md text-ink whitespace-pre-wrap">
            {contact.note}
          </p>
        </div>
      )}

      <button
        type="button"
        onClick={handleRemove}
        className="w-full flex items-center justify-center gap-1.5 h-11 rounded-btn bg-pearl-light text-wine-deep border border-line-strong shadow-soft text-label-md font-medium transition active:scale-[0.98] hover:border-wine-deep/50"
      >
        <Trash2 size={14} />
        友達から削除
      </button>
    </div>
  );
}

function Row({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <span className="text-ink-mute shrink-0">{icon}</span>
      <span className="text-body-sm text-ink-soft w-16 shrink-0">{label}</span>
      <span className="text-body-md text-ink min-w-0 flex-1 text-right truncate">
        {children}
      </span>
    </div>
  );
}

function formatDateTime(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}
