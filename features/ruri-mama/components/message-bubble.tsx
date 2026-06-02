import Image from "next/image";
import { RuriMamaAvatar } from "@/components/nightos/ruri-mama-avatar";
import { cn } from "@/lib/utils";
import type { ChatMessage } from "@/types/nightos";

/**
 * `next/image` の src として安全に渡せる値だけに絞る。
 * 不正な src（空文字 / data でも http でも先頭スラッシュでもない値）を
 * 渡すと next/image が描画中に同期 throw し、画面全体が落ちるため。
 */
function renderableImages(images: string[] | undefined): string[] {
  if (!images) return [];
  return images.filter(
    (src) =>
      typeof src === "string" &&
      (src.startsWith("data:image/") ||
        src.startsWith("https://") ||
        src.startsWith("http://") ||
        src.startsWith("/")),
  );
}

export function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";
  const images = renderableImages(message.images);
  const hasImages = images.length > 0;

  if (isUser) {
    return (
      <div className="flex justify-end">
        <div className="max-w-[82%] space-y-1.5">
          {hasImages && (
            <div className="grid grid-cols-2 gap-1.5 justify-end">
              {images.map((img, i) => (
                <div
                  key={i}
                  className="rounded-2xl overflow-hidden border border-gold/30"
                >
                  <Image
                    src={img}
                    alt={`添付画像${i + 1}`}
                    width={160}
                    height={160}
                    className="w-full h-auto object-cover"
                    unoptimized
                  />
                </div>
              ))}
            </div>
          )}
          {message.content && (
            <div className="rounded-2xl px-4 py-2.5 text-[12px] whitespace-pre-wrap leading-[1.7] shadow-soft bg-wine-deep text-pearl-light rounded-br-sm">
              {message.content}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Assistant message — show Ruri-Mama avatar to the left
  return (
    <div className="flex justify-start gap-2 items-end">
      <RuriMamaAvatar size={32} className="mb-1" />
      <div
        className={cn(
          "max-w-[78%] rounded-2xl px-4 py-2.5 text-[12px] whitespace-pre-wrap leading-[1.7] shadow-soft",
          "bg-pearl-warm border border-gold/30 text-ink rounded-bl-sm",
        )}
      >
        {message.content}
      </div>
    </div>
  );
}
