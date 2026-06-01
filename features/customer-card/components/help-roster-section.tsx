import { HandHelping } from "lucide-react";
import type { HelpCastTally } from "@/lib/nightos/master-help-split";

interface Props {
  helps: HelpCastTally[];
}

/**
 * 顧客視点の「歴代ヘルプ」。来店ごとに入れ替わる複数のヘルプを回数つきで一覧する。
 * （docs/master-vs-help-customers.md 改訂 2026-05-31）
 */
export function HelpRosterSection({ helps }: Props) {
  if (helps.length === 0) return null;

  return (
    <section className="space-y-2">
      <header className="flex items-baseline justify-between px-1">
        <h2 className="text-display-sm text-ink flex items-center gap-1.5">
          <HandHelping size={15} className="text-champagne-dark" />
          歴代ヘルプ
        </h2>
        <span className="text-label-sm text-ink-mute">{helps.length}人</span>
      </header>
      <ul className="space-y-1.5">
        {helps.map((h) => (
          <li
            key={h.cast.id}
            className="flex items-center gap-2.5 rounded-card bg-champagne/20 px-3 py-2"
          >
            <div className="w-7 h-7 rounded-full bg-champagne-dark/30 flex items-center justify-center shrink-0 text-[11px] font-medium text-ink-soft">
              {h.cast.name.slice(0, 1)}
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-body-sm font-medium text-ink">{h.cast.name}</span>
            </div>
            <div className="text-[10px] text-ink-mute text-right shrink-0">
              <div>{h.visitCount}回</div>
              <div>最終 {formatShortDate(h.lastHelpedAt)}</div>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

function formatShortDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getMonth() + 1}/${d.getDate()}`;
}
