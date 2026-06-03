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

interface Segment {
  /** 【…】の見出し。先頭の前置きなど見出しが無いブロックは null。 */
  heading: string | null;
  body: string;
}

/**
 * さくらママの本文を【見出し】単位のブロックに割る。
 * 普段あまり文章を読まない人向けに、長文を「現状 / 課題 / これからやること」
 * のような短いブロックへ分けて、間に区切り線を入れて表示するための前処理。
 * 見出しが 1 つも無ければ 1 ブロック（従来どおりのプレーン表示）になる。
 */
function parseSegments(content: string): Segment[] {
  const regex = /【([^】]+)】/g;
  const segments: Segment[] = [];
  let lastIndex = 0;
  let lastHeading: string | null = null;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(content)) !== null) {
    const body = content.slice(lastIndex, match.index).trim();
    if (lastHeading !== null || body) {
      segments.push({ heading: lastHeading, body });
    }
    lastHeading = match[1];
    lastIndex = regex.lastIndex;
  }
  const tail = content.slice(lastIndex).trim();
  if (lastHeading !== null || tail) {
    segments.push({ heading: lastHeading, body: tail });
  }
  return segments;
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
  const segments = parseSegments(message.content);
  const hasHeadings = segments.some((s) => s.heading !== null);

  return (
    <div className="flex justify-start gap-2 items-end">
      <RuriMamaAvatar size={32} className="mb-1" />
      <div
        className={cn(
          "max-w-[80%] rounded-2xl px-4 py-2.5 text-[12px] leading-[1.7] shadow-soft",
          "bg-pearl-warm border border-gold/30 text-ink rounded-bl-sm",
        )}
      >
        {hasHeadings ? (
          <div className="flex flex-col">
            {segments.map((seg, idx) => (
              <div
                key={idx}
                className={cn(
                  // ブロック間に余白＋金のヘアラインで区切り、文章を細切れに見せる
                  idx > 0 && "mt-3 pt-3 border-t border-gold/25",
                )}
              >
                {seg.heading && (
                  <div className="flex items-center gap-1.5 mb-1">
                    <span
                      aria-hidden
                      className="w-3 h-px shrink-0 bg-gold/70"
                    />
                    <span className="font-serif text-[12px] font-semibold text-wine-deep tracking-[0.04em]">
                      {seg.heading}
                    </span>
                  </div>
                )}
                {seg.body && (
                  <p className="m-0 whitespace-pre-wrap leading-[1.7]">
                    {seg.body}
                  </p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <span className="whitespace-pre-wrap">{message.content}</span>
        )}
      </div>
    </div>
  );
}
