import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { StoreTabBar } from "@/components/nightos/store-tab-bar";
import { PlanBanner } from "@/components/nightos/plan-banner";
import {
  getCurrentCast,
  getCurrentRole,
  homePathForRole,
} from "@/lib/nightos/auth";

// All store pages fetch data from Supabase (when configured), which
// uses cookies() — this requires dynamic rendering, not static generation.
export const dynamic = "force-dynamic";

export default async function StoreLayout({
  children,
}: {
  children: ReactNode;
}) {
  // Account-bound role enforcement (migration 008).
  // /store/* requires user_role in {store_staff, store_owner}.
  // Owner-only sub-pages (dashboard / funnel / douhan-pace / approvals)
  // gate themselves at the page level via the existing OwnerOnly component.
  const cast = await getCurrentCast();
  if (!cast) {
    const role = await getCurrentRole();
    if (role) redirect(homePathForRole(role));
    redirect("/");
  }
  const userRole = cast.user_role ?? "cast";
  if (userRole !== "store_staff" && userRole !== "store_owner") {
    redirect(homePathForRole(userRole));
  }

  return (
    <div className="bg-pearl min-h-dvh">
      <div className="mx-auto max-w-[520px] min-h-dvh pb-28">
        <PlanBanner />
        {children}
      </div>
      <StoreTabBar />
    </div>
  );
}
