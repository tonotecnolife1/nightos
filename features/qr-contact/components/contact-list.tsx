"use client";

import { QrCode, Search, Trash2, Users } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import {
  type ExchangedContact,
  listContacts,
  removeContact,
  subscribeContacts,
} from "../lib/contact-store";

/** チャットで会話できる相手（自分・AI を除くルームメンバー）。 */
export interface ChatFriendSeed {
  id: string;
  name: string;
  role?: string;
}

/** 一覧に並ぶ 1 行。QR 交換した連絡先か、チャットの相手のいずれか。 */
type FriendRow = {
  id: string;
  name: string;
  role?: string;
  store?: string;
  note?: string;
  /** 交換日時 (ISO)。チャット由来の相手にはない。 */
  exchangedAt?: string;
  /** "exchanged": QR 交換、"chat": チャットで会話できる相手。 */
  source: "exchanged" | "chat";
};

interface Props {
  /** 指定すると各行が `${linkBase}/${id}` の詳細ページへのリンクになる。 */
  linkBase?: string;
  /** 件数ヘッダーと検索ボックスを表示する。 */
  searchable?: boolean;
  /**
   * 指定すると空状態の「QRで友達を追加」を画面遷移ではなく
   * このハンドラで処理する（チャット内シートで連絡先交換タブを開く等）。
   */
  onAdd?: () => void;
  /**
   * チャットで会話できる相手。QR 交換していなくてもチャット可能なら友達一覧に
   * 並べる（チャットできるのに友達にいない、という齟齬を防ぐ）。交換済みの
   * 連絡先と ID が重なる場合は交換済み（削除可・詳細あり）を優先する。
   */
  chatFriends?: ChatFriendSeed[];
}

/**
 * 友達一覧。QR で交換した連絡先（localStorage）と、チャットで会話できる相手を
 * 合流させて表示する。localStorage の変化 (追加 / 削除 / 他タブ) を購読して
 * 即時反映する。
 */
export function ContactList({
  linkBase,
  searchable,
  onAdd,
  chatFriends,
}: Props) {
  const [contacts, setContacts] = useState<ExchangedContact[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [query, setQuery] = useState("");

  useEffect(() => {
    const refresh = () => setContacts(listContacts());
    refresh();
    setLoaded(true);
    return subscribeContacts(refresh);
  }, []);

  // 交換済み連絡先とチャット相手を ID で統合する。交換済みを優先（削除可・
  // 詳細ページあり）し、未交換のチャット相手だけを末尾に足す。
  const rows = useMemo<FriendRow[]>(() => {
    const byId = new Map<string, FriendRow>();
    for (const f of chatFriends ?? []) {
      byId.set(f.id, {
        id: f.id,
        name: f.name,
        role: f.role,
        source: "chat",
      });
    }
    for (const c of contacts) {
      byId.set(c.id, { ...c, source: "exchanged" });
    }
    return Array.from(byId.values()).sort((a, b) => {
      // 交換済みを先に（交換日時の新しい順）、続いてチャット相手を名前順。
      if (a.source !== b.source) return a.source === "exchanged" ? -1 : 1;
      if (a.source === "exchanged" && b.source === "exchanged") {
        return (b.exchangedAt ?? "").localeCompare(a.exchangedAt ?? "");
      }
      return a.name.localeCompare(b.name, "ja");
    });
  }, [contacts, chatFriends]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((c) =>
      [c.name, c.role, c.store, c.note]
        .filter(Boolean)
        .some((v) => v!.toLowerCase().includes(q)),
    );
  }, [rows, query]);

  if (!loaded) return null;

  if (rows.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 rounded-hero border border-dashed border-line-strong bg-pearl-light/50 px-6 py-12 text-center">
        <Users size={26} className="text-ink-mute" />
        <p className="text-body-sm text-ink-soft">
          まだ交換した友達はいません。
          <br />
          QR を読み取ると、ここに追加されます。
        </p>
        {onAdd ? (
          <button
            type="button"
            onClick={onAdd}
            className="inline-flex items-center gap-1.5 h-11 px-6 rounded-pill bg-wine-deep text-pearl-light text-label-md font-semibold shadow-warm transition active:scale-[0.98]"
          >
            <QrCode size={14} />
            QRで友達を追加
          </button>
        ) : (
          <Link
            href="/cast/connect"
            className="inline-flex items-center gap-1.5 h-11 px-6 rounded-pill bg-wine-deep text-pearl-light text-label-md font-semibold shadow-warm transition active:scale-[0.98]"
          >
            <QrCode size={14} />
            QRで友達を追加
          </Link>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {searchable && (
        <>
          <p className="text-label-sm text-ink-soft tracking-[0.06em]">
            友達 {rows.length} 人
          </p>
          <div className="flex items-center gap-2 rounded-pill border border-line-strong bg-white px-3.5 h-11">
            <Search size={15} className="text-ink-mute shrink-0" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="名前・店舗で検索"
              className="w-full bg-transparent text-body-sm text-ink outline-none placeholder:text-ink-mute"
            />
          </div>
        </>
      )}

      {filtered.length === 0 ? (
        <p className="py-8 text-center text-body-sm text-ink-soft">
          「{query}」に一致する友達はいません。
        </p>
      ) : (
        <ul className="space-y-2.5">
          {filtered.map((c) => (
            <li
              key={c.id}
              className="flex items-center gap-3 rounded-card border border-ink/[0.08] bg-pearl-light/85 backdrop-blur-md shadow-soft px-4 py-3"
            >
              <ContactRowMain row={c} linkBase={linkBase} />
              {/* チャット由来の相手は「友達から外す」概念がないので削除は出さない */}
              {c.source === "exchanged" && (
                <button
                  type="button"
                  onClick={() => removeContact(c.id)}
                  aria-label={`${c.name} を削除`}
                  className="p-2 rounded-full text-ink-mute hover:text-wine-deep hover:bg-pearl-soft transition shrink-0"
                >
                  <Trash2 size={15} />
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function ContactRowMain({
  row: c,
  linkBase,
}: {
  row: FriendRow;
  linkBase?: string;
}) {
  const meta =
    c.source === "exchanged"
      ? `${[c.role, c.store].filter(Boolean).join(" · ") || "連絡先"}・${formatDate(c.exchangedAt ?? "")}`
      : [c.role, "チャットの相手"].filter(Boolean).join(" · ");

  const inner = (
    <>
      <div className="w-11 h-11 shrink-0 rounded-full bg-wine-deep/10 border border-wine-deep/15 flex items-center justify-center">
        <span className="font-serif text-[18px] text-wine-deep">
          {c.name.trim().charAt(0) || "?"}
        </span>
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium text-body-md text-ink">{c.name}</p>
        <p className="truncate text-[11px] text-ink-soft">{meta}</p>
      </div>
    </>
  );

  const cls = "flex items-center gap-3 min-w-0 flex-1";

  // 詳細ページ (ContactDetail) は localStorage の交換済み連絡先のみ解決できる。
  // チャット由来の相手はリンクにしない（詳細にデータがなく "見つかりません"
  // になるため）。
  if (linkBase && c.source === "exchanged") {
    return (
      <Link
        href={`${linkBase}/${encodeURIComponent(c.id)}`}
        className={cn(cls, "rounded-card -m-1 p-1 hover:bg-pearl-soft/60 transition")}
      >
        {inner}
      </Link>
    );
  }
  return <div className={cls}>{inner}</div>;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getMonth() + 1}/${d.getDate()}`;
}
