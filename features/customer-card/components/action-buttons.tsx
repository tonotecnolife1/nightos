import Link from "next/link";
import { MessageCircle, Sparkles } from "lucide-react";

export function ActionButtons({ customerId }: { customerId: string }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <Link
        href={`/cast/ruri-mama?customerId=${customerId}`}
        className="flex items-center justify-center gap-2 h-12 rounded-btn bg-roseGold-deep text-pearl shadow-luxe active:scale-[0.98] transition-transform"
      >
        <Sparkles size={16} />
        <span className="text-label-md font-medium">さくらママに相談</span>
      </Link>
      <Link
        href={`/cast/templates?customerId=${customerId}`}
        className="flex items-center justify-center gap-2 h-12 rounded-btn bg-roseGold-deep text-pearl-light shadow-luxe active:scale-[0.98] transition-transform"
      >
        <MessageCircle size={16} />
        <span className="text-label-md font-medium">テンプレートで連絡</span>
      </Link>
    </div>
  );
}
