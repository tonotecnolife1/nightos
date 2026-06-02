"use client";

import { QrCode, ScanLine, Users } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import type { ContactPayload } from "../lib/contact-payload";
import { ContactConfirm } from "./contact-confirm";
import { ContactList } from "./contact-list";
import { MyQrCard } from "./my-qr-card";
import { QrScanner } from "./qr-scanner";

interface Props {
  /** 自分の連絡先ペイロード (QR 用)。 */
  myPayload: ContactPayload;
  /** 初期表示タブ。 */
  initialTab?: Tab;
  /**
   * 「連絡先」(友達一覧) タブを出すか。既定は true。
   * チャットの「友達」タブに一覧を一本化した文脈では false を渡し、
   * このハブは純粋な交換 (マイQR / 読み取る) だけにする。
   */
  showContactsTab?: boolean;
}

type Tab = "my-qr" | "scan" | "contacts";

const ALL_TABS: { key: Tab; label: string; icon: typeof QrCode }[] = [
  { key: "my-qr", label: "マイQR", icon: QrCode },
  { key: "scan", label: "読み取る", icon: ScanLine },
  { key: "contacts", label: "連絡先", icon: Users },
];

/**
 * 連絡先交換のハブ。マイQR / 読み取る / (連絡先一覧) をタブで切り替える。
 * `showContactsTab=false` のときは交換アクションだけの 2 タブになる。
 */
export function ConnectClient({
  myPayload,
  initialTab = "my-qr",
  showContactsTab = true,
}: Props) {
  const tabs = showContactsTab
    ? ALL_TABS
    : ALL_TABS.filter((t) => t.key !== "contacts");
  // contacts タブを隠す構成で initialTab="contacts" が来たら my-qr に倒す。
  const [tab, setTab] = useState<Tab>(
    initialTab === "contacts" && !showContactsTab ? "my-qr" : initialTab,
  );
  const [found, setFound] = useState<ContactPayload | null>(null);

  return (
    <div className="px-4 pt-3 pb-8">
      {/* タブ */}
      <div className="flex gap-1 rounded-pill bg-pearl-soft/80 p-1 mb-5">
        {tabs.map((t) => {
          const Icon = t.icon;
          const active = tab === t.key;
          return (
            <button
              key={t.key}
              type="button"
              onClick={() => {
                setTab(t.key);
                if (t.key !== "scan") setFound(null);
              }}
              className={cn(
                "flex-1 flex items-center justify-center gap-1.5 h-10 rounded-pill text-label-md font-medium transition",
                active
                  ? "bg-wine-deep text-pearl-light shadow-warm"
                  : "text-ink-soft hover:text-ink",
              )}
            >
              <Icon size={14} />
              {t.label}
            </button>
          );
        })}
      </div>

      {tab === "my-qr" && <MyQrCard payload={myPayload} />}

      {tab === "scan" &&
        (found ? (
          <ContactConfirm
            payload={found}
            secondaryLabel="続けて別の人を読み取る"
            onSecondary={() => setFound(null)}
          />
        ) : (
          <QrScanner onFound={setFound} />
        ))}

      {tab === "contacts" && (
        <ContactList linkBase="/cast/connect/contacts" searchable />
      )}
    </div>
  );
}
