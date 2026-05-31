"use client";

import {
  CalendarPlus,
  Pencil,
  Search,
  Trash2,
  UserPlus,
  Wine,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { Badge } from "@/components/nightos/badge";
import { Card } from "@/components/nightos/card";
import { CsvDownloadButton } from "@/components/nightos/csv-download-button";
import type { Cast, Customer } from "@/types/nightos";
import type { CsvColumn } from "@/lib/nightos/csv";
import { customerMatchesQuery } from "@/lib/nightos/customer-filters";
import { deleteCustomerAction } from "../actions";

interface Props {
  customers: Customer[];
  casts: Cast[];
}

export function CustomerListClient({ customers: initial, casts }: Props) {
  const [customers, setCustomers] = useState(initial);
  const [query, setQuery] = useState("");
  const [pending, startTransition] = useTransition();

  const filtered = useMemo(() => {
    const q = query.trim();
    if (!q) return customers;
    return customers.filter((c) => customerMatchesQuery(c, q, [c.store_memo]));
  }, [customers, query]);

  const handleDelete = (id: string, name: string) => {
    if (
      !confirm(
        `${name}さんを削除しますか？関連する来店履歴・ボトル・メモも全て削除されます。`,
      )
    )
      return;
    startTransition(async () => {
      await deleteCustomerAction(id);
      setCustomers((prev) => prev.filter((c) => c.id !== id));
    });
  };

  const castName = (id: string) =>
    casts.find((c) => c.id === id)?.name ?? "（未割当）";

  const csvColumns: CsvColumn<Customer>[] = [
    { header: "顧客ID", value: (c) => c.id },
    { header: "氏名", value: (c) => c.name },
    {
      header: "カテゴリ",
      value: (c) =>
        c.category === "vip" ? "VIP" : c.category === "new" ? "新規" : "常連",
    },
    { header: "担当キャスト", value: (c) => castName(c.cast_id) },
    { header: "誕生日", value: (c) => c.birthday ?? "" },
    { header: "職業", value: (c) => c.job ?? "" },
    { header: "好み", value: (c) => c.favorite_drink ?? "" },
    { header: "店舗メモ", value: (c) => c.store_memo ?? "" },
    {
      header: "ファネル",
      value: (c) =>
        c.funnel_stage === "line_exchanged"
          ? "LINE交換済"
          : c.funnel_stage === "assigned"
            ? "担当割当済"
            : "店舗登録のみ",
    },
    { header: "登録日", value: (c) => c.created_at },
  ];

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search
            size={13}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-mute"
          />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="名前（ひらがな可）・職業・好み・メモで検索"
            style={{ fontSize: "13px" }}
            className="w-full h-10 pl-8 pr-3 rounded-btn bg-pearl-warm border border-pearl-soft text-ink outline-none focus:border-champagne-dark placeholder:text-ink-mute"
          />
        </div>
        <Link
          href="/store/customers/new"
          className="h-10 px-3 rounded-btn bg-wine-deep text-pearl-light flex items-center gap-1 shadow-soft text-[11px] font-medium active:scale-95 transition-transform"
        >
          <UserPlus size={13} />
          新規
        </Link>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-[11px] text-ink-mute">
          {filtered.length}人 / 全{customers.length}人
        </span>
        <CsvDownloadButton
          rows={filtered}
          columns={csvColumns}
          filenamePrefix="customers"
        />
      </div>

      {filtered.length === 0 ? (
        <Card className="p-6 text-center text-body-sm text-ink-soft">
          該当するお客様が見つかりません
        </Card>
      ) : (
        <div className="space-y-2">
          {filtered.map((c) => (
            <Card key={c.id} className="p-0 overflow-hidden">
              {/* Main info */}
              <div className="px-3 pt-3 pb-2">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-body-md font-semibold text-ink truncate">
                    {c.name}
                  </span>
                  <Badge
                    tone={
                      c.category === "vip"
                        ? "vip"
                        : c.category === "new"
                          ? "new"
                          : "regular"
                    }
                  >
                    {c.category === "vip"
                      ? "VIP"
                      : c.category === "new"
                        ? "新規"
                        : "常連"}
                  </Badge>
                </div>
                <div className="text-[11px] text-ink-mute truncate">
                  {[c.job, c.favorite_drink, `担当: ${castName(c.cast_id)}`]
                    .filter(Boolean)
                    .join(" · ")}
                </div>
              </div>

              {/* Action bar */}
              <div className="flex items-center gap-1.5 px-3 pb-2.5 pt-1 border-t border-pearl-soft">
                {/* Edit */}
                <Link
                  href={`/store/customers/${c.id}/edit`}
                  className="flex items-center gap-1 px-2.5 h-7 rounded-full text-[10px] font-medium border border-pearl-soft bg-pearl-warm text-ink-soft active:scale-95"
                >
                  <Pencil size={10} />
                  編集
                </Link>

                {/* Quick: visit registration */}
                <Link
                  href={`/store/visits/new?customerId=${c.id}`}
                  className="flex items-center gap-1 px-2.5 h-7 rounded-full text-[10px] font-medium border border-gold/30 bg-champagne-soft/60 text-wine-deep active:scale-95"
                >
                  <CalendarPlus size={10} />
                  来店登録
                </Link>

                {/* Quick: bottle registration */}
                <Link
                  href={`/store/bottles/new?customerId=${c.id}`}
                  className="flex items-center gap-1 px-2.5 h-7 rounded-full text-[10px] font-medium border border-gold/30 bg-champagne-soft/60 text-gold-deep active:scale-95"
                >
                  <Wine size={10} />
                  ボトル
                </Link>

                {/* Delete */}
                <button
                  type="button"
                  onClick={() => handleDelete(c.id, c.name)}
                  disabled={pending}
                  className="ml-auto w-7 h-7 rounded-full bg-pearl-soft text-wine-deep flex items-center justify-center hover:bg-wine/10 active:scale-95 disabled:opacity-50"
                  aria-label="削除"
                >
                  <Trash2 size={11} />
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
