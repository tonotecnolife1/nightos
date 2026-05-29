"use client";

import { useEffect, useState } from "react";
import { ClipboardList, KeyRound } from "lucide-react";
import {
  getStorePermission,
  type StorePermission,
} from "@/lib/nightos/store-permission-store";
import { cn } from "@/lib/utils";

/**
 * 現在の権限（スタッフ / オーナー）を表示する小さなバッジ。
 */
export function StorePermissionBadge() {
  const [perm, setPerm] = useState<StorePermission>("owner");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setPerm(getStorePermission());
    setLoaded(true);
  }, []);

  if (!loaded) return null;

  const isOwner = perm === "owner";
  const Icon = isOwner ? KeyRound : ClipboardList;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5 rounded-badge text-[10px] font-medium",
        isOwner
          ? "bg-champagne-dark text-ink"
          : "bg-champagne text-ink-soft",
      )}
    >
      <Icon size={10} />
      {isOwner ? "オーナー" : "スタッフ"}
    </span>
  );
}
