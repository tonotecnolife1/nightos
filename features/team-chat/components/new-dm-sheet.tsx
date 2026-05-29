"use client";

import { Check, MessageCircle, Plus, Users, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { cn } from "@/lib/utils";
import type { CastMember } from "../lib/supabase-queries";
import { createDmRoomAction, createGroupRoomAction } from "../actions";

interface Props {
  storeCasts: CastMember[];
}

type Mode = "dm" | "group";

export function NewDmSheet({ storeCasts }: Props) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<Mode>("dm");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [groupName, setGroupName] = useState("");
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const openSheet = () => {
    setMode("dm");
    setSelected(new Set());
    setGroupName("");
    setOpen(true);
  };

  const closeSheet = () => {
    setOpen(false);
  };

  const toggleMember = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleDmSelect = (cast: CastMember) => {
    startTransition(async () => {
      const roomId = await createDmRoomAction(cast.id);
      if (roomId) router.push(`/cast/chat/${roomId}`);
      setOpen(false);
    });
  };

  const handleCreateGroup = () => {
    if (selected.size === 0) return;
    const name = groupName.trim() || selectedNames();
    startTransition(async () => {
      const roomId = await createGroupRoomAction(Array.from(selected), name);
      if (roomId) router.push(`/cast/chat/${roomId}`);
      setOpen(false);
    });
  };

  const selectedNames = () =>
    storeCasts
      .filter((c) => selected.has(c.id))
      .map((c) => c.name)
      .join("、");

  const canCreate = mode === "group" && selected.size > 0;

  return (
    <>
      <button
        type="button"
        onClick={openSheet}
        className="w-10 h-10 rounded-full bg-champagne-soft/60 text-gold-deep flex items-center justify-center"
        aria-label="新しいチャットを作成"
      >
        <Plus size={20} />
      </button>

      {open && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-ink/30 backdrop-blur-sm"
            onClick={closeSheet}
          />

          {/* Sheet */}
          <div className="fixed left-0 right-0 bottom-0 z-50 rounded-t-[28px] bg-pearl-warm shadow-warm animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between px-5 pt-5 pb-3">
              <h2 className="text-body-md font-medium text-ink">
                新しいチャット
              </h2>
              <button
                type="button"
                onClick={closeSheet}
                className="w-8 h-8 rounded-full text-ink-mute hover:bg-pearl-soft flex items-center justify-center"
                aria-label="閉じる"
              >
                <X size={16} />
              </button>
            </div>

            {/* Mode toggle */}
            <div className="flex gap-2 px-5 pb-3">
              <button
                type="button"
                onClick={() => { setMode("dm"); setSelected(new Set()); }}
                className={cn(
                  "flex items-center gap-1.5 px-4 py-2 rounded-pill text-[13px] font-medium border transition",
                  mode === "dm"
                    ? "bg-roseGold-deep text-pearl-light border-amethyst"
                    : "bg-transparent text-ink-soft border-ink/[0.12] hover:border-ink/20",
                )}
              >
                <MessageCircle size={13} />
                DM
              </button>
              <button
                type="button"
                onClick={() => setMode("group")}
                className={cn(
                  "flex items-center gap-1.5 px-4 py-2 rounded-pill text-[13px] font-medium border transition",
                  mode === "group"
                    ? "bg-roseGold-deep text-pearl-light border-amethyst"
                    : "bg-transparent text-ink-soft border-ink/[0.12] hover:border-ink/20",
                )}
              >
                <Users size={13} />
                グループ
              </button>
            </div>

            {/* Group name input — only in group mode */}
            {mode === "group" && (
              <div className="px-5 pb-3">
                <input
                  type="text"
                  placeholder="グループ名（省略可）"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  maxLength={40}
                  className="w-full h-10 px-3 rounded-2xl border border-ink/[0.06] bg-pearl-soft text-body-sm text-ink placeholder:text-ink-mute focus:outline-none focus:border-roseGold-deep transition"
                />
              </div>
            )}

            <div className="border-t border-ink/[0.06]" />

            {/* Cast list */}
            <div className="overflow-y-auto max-h-[50vh]">
              {storeCasts.length === 0 ? (
                <p className="px-5 py-8 text-center text-body-sm text-ink-mute">
                  同じ店舗のキャストが見つかりません
                </p>
              ) : (
                <ul className="px-3 py-2">
                  {storeCasts.map((cast) => {
                    const isChecked = selected.has(cast.id);
                    return (
                      <li key={cast.id}>
                        <button
                          type="button"
                          disabled={pending}
                          onClick={() =>
                            mode === "dm"
                              ? handleDmSelect(cast)
                              : toggleMember(cast.id)
                          }
                          className="w-full flex items-center gap-3 px-3 py-3.5 rounded-card hover:bg-pearl-soft active:bg-pearl-soft transition text-left disabled:opacity-50"
                        >
                          {/* Avatar */}
                          <div className="w-10 h-10 rounded-full bg-roseGold-soft/60 border border-blush/30 flex items-center justify-center shrink-0">
                            <span className="text-body-sm font-medium text-roseGold-deep">
                              {cast.name.charAt(0)}
                            </span>
                          </div>

                          <span className="text-body-md text-ink font-medium flex-1">
                            {cast.name}
                          </span>

                          {/* Checkbox for group mode */}
                          {mode === "group" && (
                            <div
                              className={cn(
                                "w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition",
                                isChecked
                                  ? "bg-roseGold-deep border-roseGold-deep"
                                  : "border-ink/20",
                              )}
                            >
                              {isChecked && <Check size={11} className="text-pearl-light" strokeWidth={3} />}
                            </div>
                          )}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            {/* Create group button */}
            {mode === "group" && (
              <div className="px-5 pt-2 pb-6">
                <button
                  type="button"
                  disabled={!canCreate || pending}
                  onClick={handleCreateGroup}
                  className="w-full h-11 rounded-pill bg-roseGold-deep text-pearl-light text-body-sm font-medium flex items-center justify-center gap-2 disabled:opacity-40 transition active:scale-[0.98]"
                >
                  <Users size={15} />
                  {selected.size > 0
                    ? `グループを作成（${selected.size}人）`
                    : "メンバーを選択してください"}
                </button>
              </div>
            )}

            {mode === "dm" && <div className="h-6" />}
          </div>
        </>
      )}
    </>
  );
}
