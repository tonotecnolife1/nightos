"use client";

import { Check, Gift, Ticket } from "lucide-react";
import { useState, useTransition } from "react";
import { Card } from "@/components/nightos/card";
import { issueCouponAction } from "./issue-coupon-action";

interface Props {
  customers: { id: string; name: string }[];
}

const COUPON_PRESETS = [
  { type: "drink" as const, label: "🍸 ドリンク1杯サービス", desc: "お好きなドリンクを1杯プレゼント" },
  { type: "discount" as const, label: "💰 10%OFF", desc: "次回会計から10%オフ" },
  { type: "vip" as const, label: "👑 VIPルーム無料", desc: "VIPルームを無料でご利用" },
];

export function IssueCoupon({ customers }: Props) {
  const [customerId, setCustomerId] = useState(customers[0]?.id ?? "");
  const [selectedPreset, setSelectedPreset] = useState(0);
  const [pending, startTransition] = useTransition();
  const [success, setSuccess] = useState<string | null>(null);

  const handleIssue = () => {
    const preset = COUPON_PRESETS[selectedPreset];
    const customer = customers.find((c) => c.id === customerId);
    startTransition(async () => {
      await issueCouponAction({
        customerId,
        type: preset.type,
        title: preset.label.replace(/^[^ ]+ /, ""),
        description: preset.desc,
      });
      setSuccess(`${customer?.name ?? "顧客"}さんにクーポンを発行しました`);
      setTimeout(() => setSuccess(null), 2500);
    });
  };

  return (
    <Card className="!bg-pearl-warm !border-pearl-soft p-4 space-y-3">
      <div className="flex items-center gap-2">
        <Ticket size={14} className="text-gold-deep" />
        <h3 className="text-label-md text-ink font-semibold">クーポン発行</h3>
      </div>

      <select
        value={customerId}
        onChange={(e) => setCustomerId(e.target.value)}
        className="w-full h-9 px-3 rounded-btn bg-pearl-warm border border-pearl-soft text-ink text-[12px] outline-none"
        style={{ fontSize: "13px" }}
      >
        {customers.map((c) => (
          <option key={c.id} value={c.id}>{c.name}</option>
        ))}
      </select>

      <div className="flex gap-1.5">
        {COUPON_PRESETS.map((preset, i) => (
          <button
            key={preset.type}
            type="button"
            onClick={() => setSelectedPreset(i)}
            className={`flex-1 text-center py-2 rounded-btn text-[10px] font-medium border transition-all active:scale-95 ${
              selectedPreset === i
                ? "bg-champagne-soft/60 border-gold/30 text-gold-deep"
                : "bg-pearl-warm border-pearl-soft text-ink-soft"
            }`}
          >
            {preset.label}
          </button>
        ))}
      </div>

      {success ? (
        <div className="flex items-center gap-1.5 text-[11px] text-success font-medium">
          <Check size={12} />
          {success}
        </div>
      ) : (
        <button
          type="button"
          onClick={handleIssue}
          disabled={pending}
          className="w-full h-9 rounded-btn bg-gold-metallic text-pearl-light text-[11px] font-medium shadow-soft disabled:opacity-50 active:scale-95 flex items-center justify-center gap-1"
        >
          <Gift size={12} />
          {pending ? "発行中…" : "クーポンを発行"}
        </button>
      )}
    </Card>
  );
}
