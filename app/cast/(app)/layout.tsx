import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { CastTabBar } from "@/components/nightos/cast-tab-bar";
import { PlanBanner } from "@/components/nightos/plan-banner";
import { CastProvider } from "@/lib/nightos/cast-context";
import {
  getCurrentCast,
  getCurrentManagerId,
  getCurrentRole,
  homePathForRole,
} from "@/lib/nightos/auth";
import { CURRENT_CAST_ID } from "@/lib/nightos/constants";

export const dynamic = "force-dynamic";

export default async function CastLayout({ children }: { children: ReactNode }) {
  // Account-bound role enforcement (migration 008).
  // /cast/* is restricted to user_role='cast'. Other roles are bounced to
  // their own home — they cannot URL-poke their way in.
  const cast = await getCurrentCast();
  if (!cast) {
    const role = await getCurrentRole();
    if (role) redirect(homePathForRole(role));
    // Authenticated but profile not linked → root page handles auto-link/onboarding
    redirect("/");
  }
  const userRole = cast.user_role ?? "cast";
  if (userRole !== "cast") {
    redirect(homePathForRole(userRole));
  }

  const castId = cast.id ?? CURRENT_CAST_ID;
  const managerId = await getCurrentManagerId();

  return (
    <div className="bg-pearl min-h-dvh">
      <CastProvider castId={castId} cast={cast} managerId={managerId}>
        <div className="mx-auto max-w-[520px] min-h-dvh pb-28">
          <PlanBanner />
          {children}
        </div>
        <CastTabBar />
      </CastProvider>
    </div>
  );
}
