import { redirect } from "next/navigation";
import { getCurrentCast } from "@/lib/nightos/auth";
import SettingsClient from "./settings-client";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    redirect("/cast/auth/login");
  }

  const { createServerSupabaseClient } = await import("@/lib/supabase/server");
  const supabase = createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/cast/auth/login");
  }

  const cast = await getCurrentCast();

  // Re-sign the avatar path into a short-lived URL for display (private bucket).
  let avatarUrl: string | null = null;
  if (cast?.avatar_path) {
    const { data } = await supabase.storage
      .from("cast-avatars")
      .createSignedUrl(cast.avatar_path, 60 * 60);
    avatarUrl = data?.signedUrl ?? null;
  }

  // Look up the cast's store name (everyone) + invite code (owners only).
  let currentStoreName: string | null = null;
  let storeInviteInfo: { name: string; inviteCode: string } | null = null;
  if (cast?.store_id) {
    const { data } = await supabase
      .from("nightos_stores")
      .select("name, invite_code")
      .eq("id", cast.store_id)
      .maybeSingle();
    if (data) {
      currentStoreName = (data.name as string) ?? null;
      if (cast.user_role === "store_owner") {
        storeInviteInfo = {
          name: (data.name as string) ?? "",
          inviteCode: (data.invite_code as string) ?? "",
        };
      }
    }
  }

  return (
    <SettingsClient
      email={user.email ?? ""}
      castName={cast?.name ?? null}
      userRole={cast?.user_role ?? null}
      castId={cast?.id ?? null}
      storeId={cast?.store_id ?? null}
      avatarUrl={avatarUrl}
      currentStoreName={currentStoreName}
      storeInviteInfo={storeInviteInfo}
    />
  );
}
