import { Crown, HandHelping, UserCheck } from "lucide-react";
import type { CustomerRelationship } from "@/lib/nightos/customer-relationship";

interface Props {
  relationship: CustomerRelationship;
  /** マスターの名前（assigned / help の時に「マスター: ◯◯」を出す） */
  masterName?: string | null;
}

/**
 * カルテ上部に出す「あなたとこのお客様の関係」バッジ。
 * help の場合は編集ではなく「提案」までであることを示す手がかりになる。
 */
export function RelationshipBadge({ relationship, masterName }: Props) {
  if (relationship === "manager") {
    return (
      <span className="inline-flex items-center gap-1 h-6 px-2.5 rounded-pill bg-wine-soft/30 border border-wine-deep/20 text-[11px] font-medium text-wine-deep">
        <Crown size={11} />
        あなたの管理顧客
      </span>
    );
  }
  if (relationship === "assigned") {
    return (
      <span className="inline-flex items-center gap-1 h-6 px-2.5 rounded-pill bg-success/10 border border-success/25 text-[11px] font-medium text-success">
        <UserCheck size={11} />
        あなたの担当
        {masterName && <span className="text-ink-mute font-normal">・マスター: {masterName}</span>}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 h-6 px-2.5 rounded-pill bg-champagne/40 border border-champagne-dark/30 text-[11px] font-medium text-ink-soft">
      <HandHelping size={11} />
      ヘルプで接客
      {masterName && <span className="text-ink-mute font-normal">・マスター: {masterName}</span>}
    </span>
  );
}
