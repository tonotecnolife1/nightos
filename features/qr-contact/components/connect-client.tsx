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
}

type Tab = "my-qr" | "scan" | "contacts";

const TABS: { key: Tab; label: string; icon: typeof QrCode }[] = [
  { key: "my-qr", label: "マイQR", icon: QrCode },
  { key: "scan", label: "読み取る", icon: ScanLine },
  { key: "contacts", label: "連絡先", icon: Users },
];

/**
 * 連絡先交換のハブ。マイQR / 読み取る / 連絡先一覧 をタブで切り替える。
 */
export function ConnectClient({ myPayload, initialTab = "my-qr" }: Props) {
  const [tab, setTab] = useState<Tab>(initialTab);
  const [found, setFound] = useState<ContactPayload | null>(null);

  return (
    <div className="px-4 pt-3 pb-8">
      {/* タブ */}
      <div className="flex gap-1 rounded-pill bg-pearl-soft/80 p-1 mb-5">
        {TABS.map((t) => {
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

      {tab === "contacts" && <ContactList />}
    </div>
  );
}
