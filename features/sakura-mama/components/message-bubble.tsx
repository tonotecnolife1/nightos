import Image from "next/image";
import { SakuraMamaAvatar } from "@/components/nightos/sakura-mama-avatar";
import { cn } from "@/lib/utils";
import type { ChatMessage } from "@/types/nightos";

export function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";
  const hasImages = !!message.images && message.images.length > 0;

  if (isUser) {
    return (
      <div className="flex justify-end">
        <div className="max-w-[82%] space-y-1.5">
          {hasImages && (
            <div className="grid grid-cols-2 gap-1.5 justify-end">
              {message.images!.map((img, i) => (
                <div
                  key={i}
                  className="rounded-2xl overflow-hidden border border-roseGold-border"
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
            <div className="rounded-2xl px-4 py-3 text-body-md whitespace-pre-wrap leading-relaxed shadow-soft-card rose-gradient text-pearl rounded-br-sm">
              {message.content}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Assistant message — show Sakura-Mama avatar to the left
  return (
    <div className="flex justify-start gap-2 items-end">
      <SakuraMamaAvatar size={32} className="mb-1" />
      <div
        className={cn(
          "max-w-[78%] rounded-2xl px-4 py-3 text-body-md whitespace-pre-wrap leading-relaxed shadow-soft-card",
          "bg-pearl-warm border border-amethyst-border text-ink rounded-bl-sm",
        )}
      >
        {message.content}
      </div>
    </div>
  );
}
