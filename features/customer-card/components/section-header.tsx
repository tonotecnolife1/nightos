interface Props {
  title: string;
  /** 右側に添える補足（例: 常時表示の意図を示すヒント） */
  hint?: string;
}

/**
 * 常時表示セクションの静的な見出し。
 * CollapsibleSection と同じ字面のトーンで、開閉トグルだけを持たない版。
 * 「重要なので畳まない」情報（LINE・連絡 など）に使う。
 */
export function SectionHeader({ title, hint }: Props) {
  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-label-md font-medium text-ink-soft tracking-wide uppercase text-[11px]">
        {title}
      </span>
      {hint ? <span className="text-[10px] text-ink-mute">{hint}</span> : null}
    </div>
  );
}
