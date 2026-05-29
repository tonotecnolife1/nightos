"use client";

import { Check, ChevronDown, ChevronUp, Target } from "lucide-react";
import { useState, useTransition } from "react";
import { Button } from "@/components/nightos/button";
import { Card } from "@/components/nightos/card";
import { TextInput } from "@/components/nightos/input";
import { TextAreaInput } from "@/components/nightos/textarea";
import { cn, formatCurrency } from "@/lib/utils";
import type { CastGoal } from "@/types/nightos";
import { setGoalAction } from "../actions";

interface Props {
  castId: string;
  castName: string;
  goal: CastGoal;
  setterName?: string;
}

export function GoalSettingCard({ castId, castName, goal, setterName }: Props) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [salesGoal, setSalesGoal] = useState(String(goal.salesGoal));
  const [douhanGoal, setDouhanGoal] = useState(String(goal.douhanGoal));
  const [note, setNote] = useState(goal.note ?? "");

  const salesPct =
    goal.salesGoal > 0
      ? Math.min(1, 0) // will be replaced by actual data
      : 0;

  const save = () => {
    const sg = Number(salesGoal.replace(/[^0-9]/g, ""));
    const dg = Number(douhanGoal.replace(/[^0-9]/g, ""));
    if (isNaN(sg) || isNaN(dg)) {
      setError("数値で入力してください");
      return;
    }
    setError(null);
    startTransition(async () => {
      const res = await setGoalAction(castId, {
        salesGoal: sg,
        douhanGoal: dg,
        note: note.trim() || null,
        setBy: null,
      });
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2500);
      setOpen(false);
    });
  };

  return (
    <Card
      className={cn(
        "overflow-hidden transition-all",
        open && "!border-roseGold/40",
      )}
    >
      {/* Header row */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between p-3"
      >
        <div className="flex items-center gap-2">
          <Target size={14} className="text-roseGold-dark shrink-0" />
          <span className="text-body-sm font-medium text-ink">
            今月の目標
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-[10px] text-ink-mute">売上</div>
            <div className="text-body-sm font-display text-roseGold-dark">
              {formatCurrency(goal.salesGoal)}
            </div>
          </div>
          <div className="text-right">
            <div className="text-[10px] text-ink-mute">同伴</div>
            <div className="text-body-sm font-display text-amethyst-dark">
              {goal.douhanGoal}回
            </div>
          </div>
          {open ? (
            <ChevronUp size={14} className="text-ink-mute" />
          ) : (
            <ChevronDown size={14} className="text-ink-mute" />
          )}
        </div>
      </button>

      {/* Expanded form */}
      {open && (
        <div className="border-t border-pearl-soft px-3 pb-3 pt-3 space-y-3">
          {goal.note && !open && (
            <p className="text-[11px] text-ink-soft">{goal.note}</p>
          )}

          <div className="grid grid-cols-2 gap-3">
            <TextInput
              label="売上目標（円）"
              name="sales_goal"
              value={salesGoal}
              onChange={(e) => setSalesGoal(e.target.value)}
              placeholder="例: 1500000"
              type="number"
            />
            <TextInput
              label="同伴目標（回）"
              name="douhan_goal"
              value={douhanGoal}
              onChange={(e) => setDouhanGoal(e.target.value)}
              placeholder="例: 4"
              type="number"
            />
          </div>

          <TextAreaInput
            label={`${castName}さんへのメッセージ（任意）`}
            name="note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="今月のテーマや期待値を一言で"
          />

          {error && (
            <div className="text-rose text-body-sm">{error}</div>
          )}
          {success && (
            <div className="flex items-center gap-1.5 text-emerald text-body-sm">
              <Check size={13} />
              目標を保存しました
            </div>
          )}

          <Button
            type="button"
            variant="primary"
            fullWidth
            size="md"
            disabled={pending}
            onClick={save}
          >
            {pending ? "保存中…" : "目標を保存"}
          </Button>
        </div>
      )}

      {/* Note preview when collapsed */}
      {!open && goal.note && (
        <div className="px-3 pb-2.5 text-[11px] text-ink-soft border-t border-pearl-soft pt-2">
          💬 {goal.note}
          {setterName && (
            <span className="ml-1 text-ink-mute">— {setterName}</span>
          )}
        </div>
      )}
    </Card>
  );
}
