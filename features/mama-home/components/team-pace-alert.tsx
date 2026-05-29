import Link from "next/link";
import { AlertTriangle, ChevronRight } from "lucide-react";
import { Card } from "@/components/nightos/card";
import type { DouhanPaceStats } from "@/types/nightos";

interface Props {
  paceList: DouhanPaceStats[];
}

/**
 * お店に 🔴 meeting_risk や 🟡 behind のキャストがいたら
 * ホームで目立つ警告バナーを表示する。
 */
export function TeamPaceAlert({ paceList }: Props) {
  const risky = paceList.filter((p) => p.status === "meeting_risk");
  const behind = paceList.filter((p) => p.status === "behind");

  if (risky.length === 0 && behind.length === 0) return null;

  return (
    <Link href="/mama/team" className="block active:scale-[0.99] transition-transform">
      <Card
        className={`p-3 border ${
          risky.length > 0
            ? "!border-rose/30 !bg-rose/5"
            : "!border-amber/30 !bg-amber/5"
        }`}
      >
        <div className="flex items-center gap-2">
          <AlertTriangle
            size={16}
            className={
              risky.length > 0 ? "text-rose shrink-0" : "text-amber shrink-0"
            }
          />
          <div className="flex-1 min-w-0">
            {risky.length > 0 ? (
              <>
                <div className="text-body-sm font-medium text-rose">
                  ミーティング注意: {risky.map((r) => r.castName).join("・")}
                  さん
                </div>
                <div className="text-[10px] text-ink-soft mt-0.5">
                  同伴月7回未達の見込み。至急フォローを
                </div>
              </>
            ) : (
              <>
                <div className="text-body-sm font-medium text-amber">
                  ペース遅れ: {behind.map((r) => r.castName).join("・")}さん
                </div>
                <div className="text-[10px] text-ink-soft mt-0.5">
                  同伴ペース不足。声かけのタイミング
                </div>
              </>
            )}
          </div>
          <ChevronRight size={14} className="text-ink-mute shrink-0" />
        </div>
      </Card>
    </Link>
  );
}
