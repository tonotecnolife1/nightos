"use client";

import { Trash2, Users } from "lucide-react";
import { useEffect, useState } from "react";
import {
  type ExchangedContact,
  listContacts,
  removeContact,
  subscribeContacts,
} from "../lib/contact-store";

/**
 * QR で交換した連絡先の一覧。
 * localStorage の変化 (追加 / 削除 / 他タブ) を購読して即時反映する。
 */
export function ContactList() {
  const [contacts, setContacts] = useState<ExchangedContact[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const refresh = () => setContacts(listContacts());
    refresh();
    setLoaded(true);
    return subscribeContacts(refresh);
  }, []);

  if (!loaded) return null;

  if (contacts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-hero border border-dashed border-line-strong bg-pearl-light/50 px-6 py-12 text-center">
        <Users size={26} className="text-ink-mute" />
        <p className="text-body-sm text-ink-soft">
          まだ交換した連絡先はありません。
          <br />
          QR を読み取ると、ここに追加されます。
        </p>
      </div>
    );
  }

  return (
    <ul className="space-y-2.5">
      {contacts.map((c) => (
        <li
          key={c.id}
          className="flex items-center gap-3 rounded-card border border-ink/[0.08] bg-pearl-light/85 backdrop-blur-md shadow-soft px-4 py-3"
        >
          <div className="w-11 h-11 shrink-0 rounded-full bg-wine-deep/10 border border-wine-deep/15 flex items-center justify-center">
            <span className="font-serif text-[18px] text-wine-deep">
              {c.name.trim().charAt(0) || "?"}
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate font-medium text-body-md text-ink">{c.name}</p>
            <p className="truncate text-[11px] text-ink-soft">
              {[c.role, c.store].filter(Boolean).join(" · ") || "連絡先"}
              <span className="text-ink-mute"> · {formatDate(c.exchangedAt)}</span>
            </p>
          </div>
          <button
            type="button"
            onClick={() => removeContact(c.id)}
            aria-label={`${c.name} を削除`}
            className="p-2 rounded-full text-ink-mute hover:text-wine-deep hover:bg-pearl-soft transition shrink-0"
          >
            <Trash2 size={15} />
          </button>
        </li>
      ))}
    </ul>
  );
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getMonth() + 1}/${d.getDate()}`;
}
