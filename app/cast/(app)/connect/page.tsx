import { redirect } from "next/navigation";
import { PageHeader } from "@/components/nightos/page-header";
import { ConnectClient } from "@/features/qr-contact/components/connect-client";
import type { ContactPayload } from "@/features/qr-contact/lib/contact-payload";
import { getCurrentCast } from "@/lib/nightos/auth";

export const dynamic = "force-dynamic";

/**
 * 連絡先交換ハブ (/cast/connect)。
 * LINE のように QR で個人間の連絡先を交換する。
 */
export default async function ConnectPage({
  searchParams,
}: {
  searchParams: { tab?: string };
}) {
  const cast = await getCurrentCast();
  if (!cast) redirect("/auth/login");

  let storeName: string | undefined;
  if (cast.store_id) {
    try {
      const { createServerSupabaseClient } = await import(
        "@/lib/supabase/server"
      );
      const supabase = createServerSupabaseClient();
      const { data } = await supabase
        .from("nightos_stores")
        .select("name")
        .eq("id", cast.store_id)
        .maybeSingle();
      storeName = (data?.name as string) ?? undefined;
    } catch {
      // mock 環境など Supabase 未設定の場合は店舗名なしで続行。
    }
  }

  const myPayload: ContactPayload = {
    v: 1,
    id: cast.id,
    name: cast.name,
    role: "キャスト",
    ...(storeName ? { store: storeName } : {}),
  };

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="連絡先交換"
        subtitle="QRで連絡先をやりとり"
        showBack
        backHref="/cast/home"
      />
      <ConnectClient
        myPayload={myPayload}
        initialTab={searchParams.tab === "contacts" ? "contacts" : "my-qr"}
      />
    </div>
  );
}
