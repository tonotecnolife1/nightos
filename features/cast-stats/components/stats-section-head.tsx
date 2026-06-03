interface Props {
  title: string;
  /** 右肩の eyebrow (例: "2026年") */
  sub?: string;
}

/**
 * セクション見出し — 左 gold ribbon + serif タイトル + 右 eyebrow。
 * (design ref: cast-stats.jsx SectionHead)
 */
export function StatsSectionHead({ title, sub }: Props) {
  return (
    <div className="relative flex items-baseline justify-between pl-3.5 pr-0.5">
      <span
        aria-hidden
        className="absolute left-0 top-1 bottom-1 w-[3px] rounded"
        style={{ background: "var(--gold-metallic)" }}
      />
      <h2
        className="m-0 font-serif text-[17px] leading-[1.3] font-medium text-ink"
        style={{ letterSpacing: "0.02em" }}
      >
        {title}
      </h2>
      {sub && (
        <span
          className="font-sans text-[10px] leading-none text-ink-mute"
          style={{ letterSpacing: "0.18em" }}
        >
          {sub}
        </span>
      )}
    </div>
  );
}
