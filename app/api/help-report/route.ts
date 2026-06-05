import { NextResponse } from "next/server";
import type { z } from "zod";
import Anthropic from "@anthropic-ai/sdk";
import { SAKURA_MAMA_MODEL } from "@/lib/nightos/constants";
import {
  HELP_REPORT_SYSTEM_PROMPT,
  buildGenerateUserMessage,
  buildRefineUserMessage,
  buildStubRefinedReport,
  buildStubReport,
  type HelpReportFacts,
} from "@/features/help-report/data/report-prompt";
import { MOCK_TODAY } from "@/lib/nightos/mock-data";
import { getAllCasts, getCustomerContext } from "@/lib/nightos/supabase-queries";
import { helpReportSchema, parseBody } from "@/lib/nightos/validation";
import type { Bottle, Visit } from "@/types/nightos";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const DAY_MS = 24 * 60 * 60 * 1000;

type HelpReportInput = z.infer<typeof helpReportSchema>;
type GenerateInput = Extract<HelpReportInput, { mode: "generate" }>;
type RefineInput = Extract<HelpReportInput, { mode: "refine" }>;

export interface HelpReportResponse {
  report: string;
  /** generate 時のみ。担当（マスター）スタッフ名。 */
  masterName?: string | null;
  isStub: boolean;
}

export async function POST(req: Request) {
  const parsed = await parseBody(req, helpReportSchema);
  if (parsed instanceof NextResponse) return parsed;
  const body = parsed;

  if (body.mode === "refine") {
    return handleRefine(body);
  }
  return handleGenerate(body);
}

// ─────────────────────────────────────────────────────────────
// generate — 顧客カルテ + ヘルプのメモから報告ドラフトを作る
// ─────────────────────────────────────────────────────────────

async function handleGenerate(body: GenerateInput): Promise<Response> {
  const today = process.env.NEXT_PUBLIC_SUPABASE_URL ? new Date() : MOCK_TODAY;

  const context = await getCustomerContext(body.castId, body.customerId);
  if (!context) {
    return NextResponse.json({ error: "customer_not_found" }, { status: 404 });
  }

  // 担当（マスター）名を解決
  let masterName: string | null = null;
  const masterId = context.customer.manager_cast_id ?? null;
  if (masterId) {
    const casts = await getAllCasts();
    masterName = casts.find((c) => c.id === masterId)?.name ?? null;
  }

  const customerLabel = context.customer.nickname
    ? `${context.customer.name}（${context.customer.nickname}）`
    : context.customer.name;

  const facts: HelpReportFacts = {
    customerName: customerLabel,
    masterName,
    helperName: body.helperName,
    notes: body.notes ?? "",
    category: context.customer.category,
    favoriteDrink: context.customer.favorite_drink ?? null,
    visitSummary: formatVisitSummary(context.visits, today),
    table: latestTable(context.visits),
    bottles: formatBottles(context.bottles),
    storeMemo: context.customer.store_memo ?? null,
    lastTopic: context.memo?.last_topic ?? null,
    serviceTips: context.memo?.service_tips ?? null,
    venueType: body.venueType,
  };

  // スタブ
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json<HelpReportResponse>({
      report: buildStubReport(facts),
      masterName,
      isStub: true,
    });
  }

  try {
    const report = await callClaude(buildGenerateUserMessage(facts));
    if (!report) {
      return NextResponse.json<HelpReportResponse>({
        report: buildStubReport(facts),
        masterName,
        isStub: true,
      });
    }
    return NextResponse.json<HelpReportResponse>({
      report,
      masterName,
      isStub: false,
    });
  } catch (err) {
    console.error("[help-report generate] Claude call failed:", err);
    return NextResponse.json<HelpReportResponse>({
      report: buildStubReport(facts),
      masterName,
      isStub: true,
    });
  }
}

// ─────────────────────────────────────────────────────────────
// refine — 既存の報告 + 修正方向 から書き直す
// ─────────────────────────────────────────────────────────────

async function handleRefine(body: RefineInput): Promise<Response> {
  const stubArgs = {
    previousReport: body.previousReport,
    direction: body.direction,
  };

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json<HelpReportResponse>({
      report: buildStubRefinedReport(stubArgs),
      isStub: true,
    });
  }

  try {
    const report = await callClaude(buildRefineUserMessage(stubArgs));
    if (!report) {
      return NextResponse.json<HelpReportResponse>({
        report: buildStubRefinedReport(stubArgs),
        isStub: true,
      });
    }
    return NextResponse.json<HelpReportResponse>({ report, isStub: false });
  } catch (err) {
    console.error("[help-report refine] Claude call failed:", err);
    return NextResponse.json<HelpReportResponse>({
      report: buildStubRefinedReport(stubArgs),
      isStub: true,
    });
  }
}

// ─────────────────────────────────────────────────────────────
// helpers
// ─────────────────────────────────────────────────────────────

async function callClaude(userMessage: string): Promise<string> {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const response = await client.messages.create({
    model: SAKURA_MAMA_MODEL,
    max_tokens: 1200,
    temperature: 0.6, // 報告は安定性重視
    system: HELP_REPORT_SYSTEM_PROMPT,
    messages: [{ role: "user", content: userMessage }],
  });
  return response.content
    .map((block) => (block.type === "text" ? block.text : ""))
    .join("")
    .trim();
}

function formatVisitSummary(visits: Visit[], today: Date): string | null {
  if (visits.length === 0) return null;
  // getCustomerContext は visited_at 降順
  const count = visits.length;
  const lastVisit = new Date(visits[0].visited_at);
  const daysSince = Math.max(
    0,
    Math.floor((today.getTime() - lastVisit.getTime()) / DAY_MS),
  );
  const parts = [`来店${count}回`];
  parts.push(daysSince === 0 ? "最終来店今日" : `最終来店${daysSince}日前`);
  return parts.join("・");
}

function latestTable(visits: Visit[]): string | null {
  return visits.find((v) => v.table_name)?.table_name ?? null;
}

function formatBottles(bottles: Bottle[]): string | null {
  if (bottles.length === 0) return null;
  return bottles
    .map((b) => `${b.brand}（残${b.remaining_glasses}%）`)
    .join("、");
}
