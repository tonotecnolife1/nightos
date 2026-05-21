import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import {
  SAKURA_MAMA_MODEL,
  SAKURA_MAMA_SYSTEM_PROMPT,
} from "@/features/sakura-mama/data/system-prompt";
import {
  formatExamplesForPrompt,
  retrieveRelevantExamples,
} from "@/features/sakura-mama/data/training-examples";
import {
  generateStubOptions,
  generateStubRefinedOptions,
} from "@/features/sakura-mama/data/stub-responses";
import { MOCK_TODAY } from "@/lib/nightos/mock-data";
import { buildRegionContextLine } from "@/lib/nightos/regions";
import { getCustomerContext } from "@/lib/nightos/supabase-queries";
import { parseBody, sakuraMamaSchema } from "@/lib/nightos/validation";
import type {
  Bottle,
  CustomerContext,
  Intent,
  ReplyOption,
  SakuraMamaRequest,
  SakuraMamaResponse,
  Visit,
} from "@/types/nightos";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const DAY_MS = 24 * 60 * 60 * 1000;

export async function POST(req: Request) {
  const parsed = await parseBody(req, sakuraMamaSchema);
  if (parsed instanceof NextResponse) return parsed;
  const body = parsed as SakuraMamaRequest;

  // ── Refine mode: take previous reply + direction, return 3 refined options ──
  if (body.refineStep === "apply" && body.previousReply && body.refinementDirection) {
    return handleRefineApply(body);
  }

  // Load customer context (mock or DB depending on env)
  let customerContext: CustomerContext | null = null;
  if (body.customerId) {
    customerContext = await getCustomerContext(body.castId, body.customerId);
  }

  // "Today" for stats calculation — use MOCK_TODAY when running on mock data
  // so the demo numbers stay consistent with the seed.
  const today = process.env.NEXT_PUBLIC_SUPABASE_URL ? new Date() : MOCK_TODAY;

  const contextPrefix = buildContextPrefix({
    customer: customerContext,
    hearingContext: body.hearingContext ?? {},
    intent: body.intent,
    today,
    recentFeedback: body.recentFeedback,
  });

  // Last user message is the actual query
  const lastUserMsg = [...body.messages]
    .reverse()
    .find((m) => m.role === "user");
  const userText = lastUserMsg?.content ?? "";

  // ── Stub mode ─────────────────────────────────────────────
  if (!process.env.ANTHROPIC_API_KEY) {
    const options = generateStubOptions({
      intent: body.intent,
      hearingContext: body.hearingContext ?? {},
      customer: customerContext,
      userText,
    });
    return NextResponse.json<SakuraMamaResponse>({
      options,
      reply: options[0].content,
      isStub: true,
    });
  }

  // ── Live Claude call ──────────────────────────────────────
  try {
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    // Convert the chat history. Prepend the context prefix and the 3-option
    // instruction to the LAST user message.
    // If the message has attached images, use Claude's multi-content format
    // (vision support) so the model can analyze the photos.
    const optionInstruction = build3OptionInstruction();
    const apiMessages = body.messages.map((m, idx) => {
      const isLastUser =
        idx === body.messages.length - 1 && m.role === "user";
      const finalText = isLastUser
        ? contextPrefix
          ? `${contextPrefix}\n\n${m.content}\n\n${optionInstruction}`
          : `${m.content}\n\n${optionInstruction}`
        : m.content;

      // Messages without images stay as plain text (simpler, cheaper)
      if (!m.images || m.images.length === 0) {
        return { role: m.role, content: finalText };
      }

      // With images: use the multi-content vision format
      const contentBlocks: Anthropic.Messages.ContentBlockParam[] = [];
      for (const dataUrl of m.images) {
        const parsed = parseDataUrl(dataUrl);
        if (parsed) {
          contentBlocks.push({
            type: "image",
            source: {
              type: "base64",
              media_type: parsed.mediaType,
              data: parsed.base64,
            },
          });
        }
      }
      contentBlocks.push({ type: "text", text: finalText });
      return { role: m.role, content: contentBlocks };
    });

    // ── RAG: retrieve relevant training examples ──
    const relevantExamples = retrieveRelevantExamples({
      userText,
      intent: body.intent,
      customerCategory: customerContext?.customer.category,
      limit: 3,
    });
    const examplesBlock = formatExamplesForPrompt(relevantExamples);
    const enrichedSystem = examplesBlock
      ? `${SAKURA_MAMA_SYSTEM_PROMPT}\n\n${examplesBlock}`
      : SAKURA_MAMA_SYSTEM_PROMPT;

    const response = await client.messages.create({
      model: SAKURA_MAMA_MODEL,
      max_tokens: 1500, // 3 options need more tokens
      temperature: 0.8, // slightly higher for variation between options
      system: enrichedSystem,
      messages: apiMessages,
    });

    const rawText = extractText(response.content);
    const options = parseOptionsFromText(rawText);

    if (options.length < 3) {
      // Parse failed — fall back to stub so UX isn't broken
      console.warn("[sakura-mama] 3-option parse failed, using stub");
      const stubOptions = generateStubOptions({
        intent: body.intent,
        hearingContext: body.hearingContext ?? {},
        customer: customerContext,
        userText,
      });
      return NextResponse.json<SakuraMamaResponse>({
        options: stubOptions,
        reply: stubOptions[0].content,
        isStub: true,
      });
    }

    return NextResponse.json<SakuraMamaResponse>({
      options,
      reply: options[0].content,
      isStub: false,
    });
  } catch (err) {
    console.error("[sakura-mama] Claude call failed:", err);
    const options = generateStubOptions({
      intent: body.intent,
      hearingContext: body.hearingContext ?? {},
      customer: customerContext,
      userText,
    });
    return NextResponse.json<SakuraMamaResponse>({
      options,
      reply: options[0].content,
      isStub: true,
    });
  }
}

// ═══════════════════════════════════════════════════════════
// 3-option instruction appended to user message
// ═══════════════════════════════════════════════════════════

function build3OptionInstruction(): string {
  return `【重要】今回の相談には、以下のフォーマットで**3つの異なるスタイルの回答**を出してください。
同じ内容の焼き直しではなく、各オプションで切り口やトーンを変えること。

出力は JSON だけ。前後の説明文は一切不要。

{
  "options": [
    {
      "id": "A",
      "style": "safe",
      "label": "丁寧に寄り添う",
      "content": "安全策。王道で、品と丁寧さを最優先した回答。文面例を含めて3〜5行でまとめる。"
    },
    {
      "id": "B",
      "style": "practical",
      "label": "端的で実用的",
      "content": "実用派。短く切れ味よく、次の行動が明確な回答。文面例は短め。"
    },
    {
      "id": "C",
      "style": "warm",
      "label": "温かみと遊び心",
      "content": "情緒派。自嘲・温度・遊び心のある言い回しで心を掴む回答。"
    }
  ]
}

各 content は【文面例】や【なぜ効くか】のセクションを含む、実用に耐える具体性で。絵文字は1〜2個まで。`;
}

// ═══════════════════════════════════════════════════════════
// Parse Claude's JSON response into ReplyOption[]
// ═══════════════════════════════════════════════════════════

function parseOptionsFromText(text: string): ReplyOption[] {
  // Try to extract JSON from the response (in case there's extra text)
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) return [];

  try {
    const parsed = JSON.parse(jsonMatch[0]) as {
      options?: Array<{
        id?: string;
        style?: string;
        label?: string;
        content?: string;
      }>;
    };
    if (!parsed.options || !Array.isArray(parsed.options)) return [];

    const validStyles = ["safe", "practical", "warm"] as const;
    const validIds = ["A", "B", "C"] as const;

    return parsed.options
      .filter(
        (o): o is Required<NonNullable<typeof parsed.options>[0]> =>
          !!(o.id && o.style && o.label && o.content),
      )
      .map((o) => ({
        id: (validIds as readonly string[]).includes(o.id)
          ? (o.id as "A" | "B" | "C")
          : "A",
        style: (validStyles as readonly string[]).includes(o.style)
          ? (o.style as "safe" | "practical" | "warm")
          : "safe",
        label: o.label,
        content: o.content,
      }))
      .slice(0, 3);
  } catch (err) {
    console.warn("[sakura-mama] JSON parse error:", err);
    return [];
  }
}

// ═══════════════════════════════════════════════════════════
// Refine: take previous reply + direction → 3 refined options
// ═══════════════════════════════════════════════════════════

async function handleRefineApply(
  body: SakuraMamaRequest,
): Promise<Response> {
  const previousReply = body.previousReply ?? "";
  const direction = body.refinementDirection ?? "";

  // Stub mode
  if (!process.env.ANTHROPIC_API_KEY) {
    const options = generateStubRefinedOptions({ previousReply, direction });
    return NextResponse.json<SakuraMamaResponse>({
      options,
      reply: options[0].content,
      isStub: true,
    });
  }

  try {
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const userMsg = `【前回の回答】
${previousReply}

【ブラッシュアップの方向性】
${direction}

上の回答を、指定の方向性に沿って3パターンで書き直してください。
元の構造（【文面例】【なぜ効くか】などのセクション）は維持。
各パターンは style (safe/practical/warm) で明確に差別化して。

出力は JSON のみ、前後の説明文なし。

{
  "options": [
    {"id": "A", "style": "safe", "label": "ラベル", "content": "..."},
    {"id": "B", "style": "practical", "label": "ラベル", "content": "..."},
    {"id": "C", "style": "warm", "label": "ラベル", "content": "..."}
  ]
}`;

    const response = await client.messages.create({
      model: SAKURA_MAMA_MODEL,
      max_tokens: 1500,
      temperature: 0.8,
      system: SAKURA_MAMA_SYSTEM_PROMPT,
      messages: [{ role: "user" as const, content: userMsg }],
    });

    const rawText = extractText(response.content);
    const options = parseOptionsFromText(rawText);

    if (options.length < 3) {
      const stub = generateStubRefinedOptions({ previousReply, direction });
      return NextResponse.json<SakuraMamaResponse>({
        options: stub,
        reply: stub[0].content,
        isStub: true,
      });
    }

    return NextResponse.json<SakuraMamaResponse>({
      options,
      reply: options[0].content,
      isStub: false,
    });
  } catch (err) {
    console.error("[sakura-mama refine] Claude call failed:", err);
    const options = generateStubRefinedOptions({ previousReply, direction });
    return NextResponse.json<SakuraMamaResponse>({
      options,
      reply: options[0].content,
      isStub: true,
    });
  }
}

// ═══════════════════════════════════════════════════════════
// Context prefix — deliberately rich so Claude has enough to
// produce specific, grounded advice. Visit stats, all bottles,
// and every memo field are included.
// ═══════════════════════════════════════════════════════════

function buildContextPrefix(opts: {
  customer: CustomerContext | null;
  hearingContext: Record<string, string>;
  intent: Intent;
  today: Date;
  recentFeedback?: { helpful: string[]; notHelpful: string[] };
}): string {
  const lines: string[] = [];

  // Time/season context — helps Sakura-Mama adjust tone
  const now = new Date();
  const hour = now.getHours();
  const weekdays = ["日", "月", "火", "水", "木", "金", "土"];
  const dayOfWeek = weekdays[now.getDay()];
  const month = now.getMonth() + 1;
  const season =
    month >= 3 && month <= 5
      ? "春"
      : month >= 6 && month <= 8
        ? "夏"
        : month >= 9 && month <= 11
          ? "秋"
          : "冬";
  const timeLabel =
    hour < 12
      ? "午前（お客様への連絡の時間帯）"
      : hour < 17
        ? "午後"
        : hour < 20
          ? "開店前"
          : "営業中";
  lines.push(
    `[現在] ${month}月（${season}）・${dayOfWeek}曜日・${timeLabel}`,
  );
  lines.push("");

  if (opts.customer) {
    const { customer, memo, bottles, visits } = opts.customer;
    lines.push("[顧客カルテ]");
    lines.push(`名前: ${customer.name}`);
    if (customer.job) lines.push(`職業: ${customer.job}`);

    if (customer.birthday) {
      lines.push(`誕生日: ${formatBirthdayWithCountdown(customer.birthday, opts.today)}`);
    }

    lines.push(
      `カテゴリ: ${
        customer.category === "vip"
          ? "VIP"
          : customer.category === "new"
            ? "新規"
            : "常連"
      }`,
    );

    if (customer.favorite_drink)
      lines.push(`好きなお酒: ${customer.favorite_drink}`);

    if (customer.region) {
      const regionLine = buildRegionContextLine(customer.region);
      if (regionLine) lines.push(regionLine);
    }

    // Visit stats — lets Sakura-Mama gauge customer temperature
    if (visits.length > 0) {
      lines.push(formatVisitStats(visits, opts.today));
    }

    // ALL bottles, not just the first
    if (bottles.length > 0) {
      lines.push(`キープボトル: ${formatBottles(bottles)}`);
    }

    if (customer.store_memo) lines.push(`店舗メモ: ${customer.store_memo}`);
    if (memo?.last_topic) lines.push(`前回の話題: ${memo.last_topic}`);
    if (memo?.service_tips) lines.push(`接客のコツ: ${memo.service_tips}`);
    if (memo?.next_topics) lines.push(`次回の話題候補: ${memo.next_topics}`);
    lines.push("");
  }

  const hearingEntries = Object.entries(opts.hearingContext);
  if (hearingEntries.length > 0) {
    lines.push("[ヒアリング回答]");
    for (const [k, v] of hearingEntries) {
      lines.push(`- ${k}: ${v}`);
    }
    lines.push("");
  }

  if (opts.intent && opts.intent !== "freeform") {
    const intentLabel: Record<Intent, string> = {
      follow: "お客様への連絡",
      serving: "接客中の急ぎ相談",
      strategy: "営業戦略",
      freeform: "",
    };
    lines.push(`[相談カテゴリ] ${intentLabel[opts.intent]}`);
    lines.push("");
  }

  // Recent feedback from the cast — bias the next reply toward what they
  // already said was helpful and away from what wasn't.
  if (opts.recentFeedback) {
    const { helpful, notHelpful } = opts.recentFeedback;
    if (helpful.length > 0 || notHelpful.length > 0) {
      lines.push("[キャストのフィードバック傾向]");
      if (helpful.length > 0) {
        lines.push("このキャストが「参考になった」と評価した過去の回答（抜粋）:");
        helpful.slice(-3).forEach((s) => lines.push(`  ✓ ${s}`));
      }
      if (notHelpful.length > 0) {
        lines.push(
          "このキャストが「参考にならなかった」と評価した過去の回答（抜粋）:",
        );
        notHelpful.slice(-3).forEach((s) => lines.push(`  ✗ ${s}`));
      }
      lines.push(
        "→ 上の傾向を参考にしつつ、似た失敗を繰り返さず、好まれた方向で答えてください。",
      );
      lines.push("");
    }
  }

  if (lines.length > 0) {
    lines.push("[相談内容]");
  }

  return lines.join("\n");
}

function formatBirthdayWithCountdown(birthday: string, today: Date): string {
  // birthday is YYYY-MM-DD
  const parts = birthday.split("-").map((n) => parseInt(n, 10));
  if (parts.length < 3) return birthday;
  const [, mo, da] = parts;
  if (!mo || !da) return birthday;

  let next = new Date(today.getFullYear(), mo - 1, da);
  if (next.getTime() < today.getTime()) {
    next = new Date(today.getFullYear() + 1, mo - 1, da);
  }
  const daysUntil = Math.floor((next.getTime() - today.getTime()) / DAY_MS);
  const label = `${mo}月${da}日`;
  if (daysUntil <= 14) {
    return `${label}（あと${daysUntil}日）`;
  }
  return label;
}

function formatVisitStats(visits: Visit[], today: Date): string {
  // visits are sorted desc by visited_at in getCustomerContext
  const count = visits.length;
  const lastVisit = new Date(visits[0].visited_at);
  const daysSince = Math.max(
    0,
    Math.floor((today.getTime() - lastVisit.getTime()) / DAY_MS),
  );

  let interval = 0;
  if (count >= 2) {
    const gaps: number[] = [];
    for (let i = 0; i < count - 1; i++) {
      const a = new Date(visits[i].visited_at).getTime();
      const b = new Date(visits[i + 1].visited_at).getTime();
      gaps.push(Math.floor((a - b) / DAY_MS));
    }
    interval = Math.round(gaps.reduce((s, g) => s + g, 0) / gaps.length);
  }

  const parts = [`来店${count}回`];
  parts.push(daysSince === 0 ? "最終来店今日" : `最終来店${daysSince}日前`);
  if (interval > 0) parts.push(`通常は${interval}日間隔`);
  return `来店: ${parts.join("、")}`;
}

function formatBottles(bottles: Bottle[]): string {
  return bottles
    .map((b) => `${b.brand}（残${b.remaining_glasses}杯/${b.total_glasses}杯）`)
    .join("、");
}

/**
 * "data:image/jpeg;base64,..." 形式から media_type と base64 data を抽出。
 */
function parseDataUrl(
  dataUrl: string,
): { mediaType: "image/jpeg" | "image/png" | "image/webp" | "image/gif"; base64: string } | null {
  const match = dataUrl.match(/^data:(image\/(?:jpeg|png|webp|gif));base64,(.+)$/);
  if (!match) return null;
  return {
    mediaType: match[1] as "image/jpeg" | "image/png" | "image/webp" | "image/gif",
    base64: match[2],
  };
}

function extractText(content: Anthropic.Messages.ContentBlock[]): string {
  return content
    .map((block) => (block.type === "text" ? block.text : ""))
    .join("")
    .trim();
}
