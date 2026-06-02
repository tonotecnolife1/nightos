import Link from "next/link";
import { MessageCircle, Sparkles } from "lucide-react";

export function ActionButtons({ customerId }: { customerId: string }) {
  return (
    <div className="flex flex-col sm:grid sm:grid-cols-2 gap-3">
      <Link
        href={`/cast/ruri-mama?customerId=${customerId}`}
        className="flex items-center justify-center gap-2 h-12 rounded-btn bg-wine-deep text-pearl-light shadow-luxe active:scale-[0.98] transition-transform"
      >
        <Sparkles size={16} className="shrink-0" />
        <span className="text-label-md font-medium whitespace-nowrap">さくらママに相談</span>
      </Link>
      <Link
        href={`/cast/templates?customerId=${customerId}`}
        className="flex items-center justify-center gap-2 h-12 rounded-btn bg-wine-deep text-pearl-light shadow-luxe active:scale-[0.98] transition-transform"
      >
        <MessageCircle size={16} className="shrink-0" />
        <span className="text-label-md font-medium whitespace-nowrap">テンプレートで連絡</span>
      </Link>
    </div>
  );
}
