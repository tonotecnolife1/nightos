import type { ReactNode } from "react";
import { CastTabBar } from "@/components/nightos/cast-tab-bar";
import { PlanBanner } from "@/components/nightos/plan-banner";

export const dynamic = "force-dynamic";

export default function MamaLayout({ children }: { children: ReactNode }) {
  return (
    <div className="bg-pearl min-h-dvh">
      <div className="mx-auto max-w-[520px] min-h-dvh pb-28">
        <PlanBanner />
        {children}
      </div>
      <CastTabBar />
    </div>
  );
}
