import { MapPin } from "lucide-react";
import { Badge } from "@/components/nightos/badge";
import { formatCustomerName } from "@/lib/utils";
import { findRegion } from "@/lib/nightos/regions";
import type { Customer } from "@/types/nightos";

const categoryLabel: Record<Customer["category"], string> = {
  vip: "VIP",
  regular: "常連",
  new: "新規",
};

const categoryTone = {
  vip: "vip" as const,
  regular: "regular" as const,
  new: "new" as const,
};

export function CustomerHeader({ customer }: { customer: Customer }) {
  return (
    <div className="space-y-2">
      <div className="flex items-baseline gap-3">
        <h1 className="font-serif text-[2rem] leading-[1.15] font-medium tracking-[0.02em] text-ink">
          {formatCustomerName(customer.name)}
        </h1>
        <Badge tone={categoryTone[customer.category]}>
          {categoryLabel[customer.category]}
        </Badge>
      </div>
      <div className="flex items-center gap-x-3 gap-y-1 flex-wrap text-body-sm text-ink-soft">
        {customer.job && <span>{customer.job}</span>}
        {customer.birthday && (
          <>
            <span className="text-ink-mute">•</span>
            <span>誕生日 {formatBirthday(customer.birthday)}</span>
          </>
        )}
        {customer.region && (
          <>
            <span className="text-ink-mute">•</span>
            <span className="inline-flex items-center gap-1">
              <MapPin size={11} className="text-gold-deep" />
              {customer.region}
              {findRegion(customer.region) && (
                <span className="text-ink-mute text-[10px]">
                  （{findRegion(customer.region)?.label}）
                </span>
              )}
            </span>
          </>
        )}
      </div>
    </div>
  );
}

function formatBirthday(raw: string): string {
  const [yr, mo, da] = raw.split("-");
  if (!mo || !da) return raw;
  const base = `${parseInt(mo, 10)}月${parseInt(da, 10)}日`;
  return yr && yr !== "0000" ? `${yr}年${base}` : base;
}
