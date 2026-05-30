"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Lock } from "lucide-react";
import { Card } from "@/components/nightos/card";
import { getStorePermission } from "@/lib/nightos/store-permission-store";

/**
 * オーナー権限がないユーザーには、スタッフ用の代替表示を出す。
 * スタッフがオーナーページを開いた時のフォールバック。
 */
export function OwnerGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isOwner, setIsOwner] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setIsOwner(getStorePermission() === "owner");
    setLoaded(true);
  }, []);

  if (!loaded) return null;

  if (!isOwner) {
    return (
      <div className="animate-fade-in px-5 pt-12 pb-6 flex flex-col items-center text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-pearl-soft flex items-center justify-center">
          <Lock size={24} className="text-ink-mute" />
        </div>
        <div>
          <h1 className="text-display-sm text-ink mb-1">オーナー限定の画面です</h1>
          <p className="text-body-sm text-ink-soft">
            この画面は店舗オーナー権限を持つ方のみご利用いただけます。
          </p>
        </div>
        <Card className="p-3 w-full max-w-xs text-left">
          <p className="text-[11px] text-ink-mute">
            ご自身がオーナーの場合は、一度「アプリを切り替える」からオーナー権限でログインし直してください。
          </p>
        </Card>
        <button
          type="button"
          onClick={() => router.push("/store")}
          className="h-10 px-5 rounded-btn bg-pearl-soft text-ink-soft text-label-md active:scale-[0.98]"
        >
          ホームに戻る
        </button>
      </div>
    );
  }

  return <>{children}</>;
}
