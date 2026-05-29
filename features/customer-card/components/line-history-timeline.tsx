"use client";

import Image from "next/image";
import { useState } from "react";
import { MessageCircle } from "lucide-react";
import { EmptyState } from "@/components/nightos/empty-state";
import { ImageLightbox } from "./image-lightbox";
import type { LineScreenshot } from "@/types/nightos";

interface Props {
  screenshots: LineScreenshot[];
  customerName: string;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()}`;
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  return `${d.getHours()}:${String(d.getMinutes()).padStart(2, "0")}`;
}

export function LineHistoryTimeline({ screenshots, customerName }: Props) {
  const [lightbox, setLightbox] = useState<string | null>(null);

  if (screenshots.length === 0) {
    return (
      <EmptyState
        icon={<MessageCircle size={22} />}
        title="LINE会話履歴がまだありません"
        description="お客様とのLINEスクショをアップロードすると、さくらママが内容を自動で解析してここに蓄積されます。"
        tone="amethyst"
      />
    );
  }

  // Oldest first for chronological reading
  const sorted = [...screenshots].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
  );

  // Group by date
  const byDate = new Map<string, LineScreenshot[]>();
  for (const ss of sorted) {
    const d = formatDate(ss.created_at);
    const group = byDate.get(d) ?? [];
    group.push(ss);
    byDate.set(d, group);
  }

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-display-sm text-ink flex items-center gap-2">
          <MessageCircle size={16} />
          LINE やりとり履歴
        </h3>
        <span className="text-label-sm text-ink-mute">{screenshots.length}件</span>
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-[19px] top-0 bottom-0 w-px bg-pearl-soft" />

        <div className="space-y-0">
          {Array.from(byDate.entries()).map(([date, entries]) => (
            <div key={date}>
              {/* Date marker */}
              <div className="relative flex items-center gap-3 mb-2 mt-4 first:mt-0">
                <div className="w-10 h-10 shrink-0 flex items-center justify-center z-10">
                  <div className="w-2.5 h-2.5 rounded-full bg-gold-deep border-2 border-pearl" />
                </div>
                <span className="text-[11px] font-medium text-ink-mute bg-pearl px-2 py-0.5 rounded-full border border-pearl-soft">
                  {date}
                </span>
              </div>

              {/* Entries for this date */}
              {entries.map((ss) => (
                <TimelineEntry
                  key={ss.id}
                  screenshot={ss}
                  customerName={customerName}
                  onImageClick={() => setLightbox(ss.image_data)}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      {lightbox && (
        <ImageLightbox
          src={lightbox}
          alt={`${customerName}さまとのLINE会話`}
          onClose={() => setLightbox(null)}
        />
      )}
    </div>
  );
}

function TimelineEntry({
  screenshot,
  customerName,
  onImageClick,
}: {
  screenshot: LineScreenshot;
  customerName: string;
  onImageClick: () => void;
}) {
  const { extracted } = screenshot;
  const time = formatTime(screenshot.created_at);

  return (
    <div className="relative flex items-start gap-3 pb-4 pl-0">
      {/* Connector dot */}
      <div className="w-10 shrink-0 flex justify-center pt-2 z-10">
        <div className="w-1.5 h-1.5 rounded-full bg-pearl-soft border border-ink/10" />
      </div>

      {/* Content card */}
      <div className="flex-1 min-w-0 rounded-2xl border border-ink/[0.06] bg-pearl-warm overflow-hidden">
        {/* Thumbnail row */}
        <div className="flex items-start gap-3 p-3">
          <button
            type="button"
            onClick={onImageClick}
            className="w-14 h-14 rounded-xl overflow-hidden shrink-0 bg-pearl-soft border border-ink/[0.06] hover:opacity-80 active:scale-95 transition-all"
            aria-label="画像を拡大"
          >
            <Image
              src={screenshot.image_data}
              alt={`${customerName}さまとのLINE`}
              width={56}
              height={56}
              className="w-full h-full object-cover"
              unoptimized
            />
          </button>

          <div className="flex-1 min-w-0 space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-ink-mute">{time}</span>
              <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-medium ${
                extracted.confidence === "high"
                  ? "bg-success/10 text-success"
                  : extracted.confidence === "medium"
                    ? "bg-champagne-dark text-ink"
                    : "bg-pearl-soft text-ink-mute"
              }`}>
                {extracted.confidence === "high" ? "高精度" : extracted.confidence === "medium" ? "中精度" : "低精度"}
              </span>
            </div>

            {/* Summary */}
            {extracted.summary && (
              <p className="text-body-sm text-ink leading-relaxed">
                {extracted.summary}
              </p>
            )}
          </div>
        </div>

        {/* Details strip */}
        {(extracted.last_topic || extracted.service_tips || extracted.next_topics) && (
          <div className="border-t border-pearl-soft px-3 py-2 space-y-1.5 bg-pearl-soft/40">
            {extracted.last_topic && (
              <DetailRow label="話題" value={extracted.last_topic} />
            )}
            {extracted.service_tips && (
              <DetailRow label="ヒント" value={extracted.service_tips} />
            )}
            {extracted.next_topics && (
              <DetailRow label="次回" value={extracted.next_topics} />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline gap-1.5 text-body-sm">
      <span className="shrink-0 text-[10px] font-medium text-ink-mute bg-pearl-warm rounded px-1 py-0.5">
        {label}
      </span>
      <span className="text-ink-soft">{value}</span>
    </div>
  );
}
