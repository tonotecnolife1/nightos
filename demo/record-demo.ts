/**
 * NIGHTOS — Automated demo recording script
 *
 * Usage:
 *   npm run dev          # start the dev server in another terminal
 *   npx tsx demo/record-demo.ts
 *
 * Or with Playwright's built-in runner:
 *   npx playwright install chromium   # first time only
 *   npx tsx demo/record-demo.ts
 *
 * Output: demo/output/nightos-demo.webm (screen recording)
 *         demo/output/screenshots/  (key-frame PNGs)
 *
 * The script runs through the core value prop flows at a pace that
 * looks good on video (~3 minutes total).
 */

import { chromium, type Page } from "playwright";
import { mkdirSync } from "fs";
import { join } from "path";

const BASE_URL = process.env.DEMO_URL ?? "http://localhost:3000";
const OUTPUT_DIR = join(__dirname, "output");
const SCREENSHOT_DIR = join(OUTPUT_DIR, "screenshots");
const SLOWMO = 400; // ms between actions — looks natural on video
const VIEWPORT = { width: 390, height: 844 }; // iPhone 14 Pro size

async function main() {
  mkdirSync(SCREENSHOT_DIR, { recursive: true });

  console.log("🎬 Starting NIGHTOS demo recording...");
  console.log(`   Target: ${BASE_URL}`);
  console.log(`   Output: ${OUTPUT_DIR}`);

  const browser = await chromium.launch({
    headless: true,
    slowMo: SLOWMO,
  });

  const context = await browser.newContext({
    viewport: VIEWPORT,
    locale: "ja-JP",
    recordVideo: {
      dir: OUTPUT_DIR,
      size: VIEWPORT,
    },
  });

  const page = await context.newPage();

  try {
    // ═══════════════ Scene 1: Role selector ═══════════════
    console.log("📱 Scene 1: Role selector");
    await page.goto(BASE_URL);
    await page.waitForSelector("text=NIGHTOS");
    await screenshot(page, "01-role-selector");
    await wait(2000);

    // ═══════════════ Scene 2: Cast Home ═══════════════
    console.log("📱 Scene 2: Cast Home");
    // Clear localStorage to ensure fresh start
    await page.evaluate(() => localStorage.clear());
    await page.goto(BASE_URL);
    await wait(1000);
    await page.click("text=キャスト（あかり）");
    await page.waitForSelector("text=おかえりなさい");
    await wait(2000);
    await screenshot(page, "02-cast-home");

    // Scroll down to see follow targets
    await page.evaluate(() => window.scrollTo({ top: 400, behavior: "smooth" }));
    await wait(2000);
    await screenshot(page, "03-follow-targets");

    // ═══════════════ Scene 3: Customer Card ═══════════════
    console.log("📱 Scene 3: Customer card");
    await page.click("text=田中 太郎");
    await page.waitForSelector("text=顧客カルテ");
    await wait(1500);
    await screenshot(page, "04-customer-card");

    // Scroll to see store info + memo
    await page.evaluate(() => window.scrollTo({ top: 300, behavior: "smooth" }));
    await wait(1500);
    await screenshot(page, "05-store-info-memo");

    // Scroll to see LINE import + action buttons
    await page.evaluate(() => window.scrollTo({ top: 600, behavior: "smooth" }));
    await wait(1500);
    await screenshot(page, "06-line-import");

    // ═══════════════ Scene 4: Templates ═══════════════
    console.log("📱 Scene 4: Templates");
    await page.click("text=テンプレートで連絡");
    await page.waitForSelector("text=メッセージテンプレート");
    await wait(1500);
    await screenshot(page, "07-templates");

    // Scroll to see template cards
    await page.evaluate(() => window.scrollTo({ top: 300, behavior: "smooth" }));
    await wait(2000);
    await screenshot(page, "08-template-cards");

    // ═══════════════ Scene 5: Sakura-Mama AI Chat ═══════════════
    console.log("📱 Scene 5: Sakura-Mama chat");
    // Navigate via tab bar
    await page.goto(`${BASE_URL}/cast/sakura-mama`);
    await page.waitForSelector("text=さくらママ");
    await wait(1500);
    await screenshot(page, "09-sakura-mama-picker");

    // Pick "LINEで連絡したい"
    await page.click("text=LINEで連絡したい");
    await wait(1000);
    await screenshot(page, "10-hearing-chips");

    // Select purpose chip
    const purposeChip = page.locator("button", { hasText: "お礼" });
    if (await purposeChip.isVisible()) {
      await purposeChip.click();
      await wait(800);
    }

    // Select mood chip
    const moodChip = page.locator("button", { hasText: "盛り上がった" });
    if (await moodChip.isVisible()) {
      await moodChip.click();
      await wait(800);
    }

    // Select tone chip
    const toneChip = page.locator("button", { hasText: "親しみやすく" });
    if (await toneChip.isVisible()) {
      await toneChip.click();
      await wait(1000);
    }

    // Wait for response
    console.log("   ⏳ Waiting for Sakura-Mama response...");
    await page.waitForSelector("text=【アドバイス】", { timeout: 30000 }).catch(() => {
      // Stub mode might not have this exact text, wait a bit more
    });
    await wait(3000);
    await screenshot(page, "11-sakura-mama-response");

    // Scroll to see full response
    await page.evaluate(() => {
      const scrollEl = document.querySelector("[class*='overflow-y-auto']");
      if (scrollEl) scrollEl.scrollTo({ top: scrollEl.scrollHeight, behavior: "smooth" });
    });
    await wait(2000);
    await screenshot(page, "12-sakura-mama-full-response");

    // ═══════════════ Scene 6: Cast Stats ═══════════════
    console.log("📱 Scene 6: Cast stats");
    await page.goto(`${BASE_URL}/cast/stats`);
    await page.waitForSelector("text=あなたの成績");
    await wait(1500);
    await screenshot(page, "13-cast-stats");

    await page.evaluate(() => window.scrollTo({ top: 400, behavior: "smooth" }));
    await wait(1500);
    await screenshot(page, "14-cast-stats-trends");

    // ═══════════════ Scene 7: Switch to Store ═══════════════
    console.log("📱 Scene 7: Store side");
    await page.evaluate(() => {
      localStorage.setItem("nightos.role", "store");
    });
    await page.goto(`${BASE_URL}/store`);
    await page.waitForSelector("text=Store Console");
    await wait(2000);
    await screenshot(page, "15-store-hub");

    // Scroll to see management links
    await page.evaluate(() => window.scrollTo({ top: 400, behavior: "smooth" }));
    await wait(1500);
    await screenshot(page, "16-store-management");

    // ═══════════════ Scene 8: Store Dashboard ═══════════════
    console.log("📱 Scene 8: Store dashboard");
    await page.goto(`${BASE_URL}/store/dashboard`);
    await page.waitForSelector("text=効果ダッシュボード");
    await wait(1500);
    await screenshot(page, "17-store-dashboard");

    // Scroll to trends
    await page.evaluate(() => window.scrollTo({ top: 400, behavior: "smooth" }));
    await wait(1500);
    await screenshot(page, "18-dashboard-trends");

    // Scroll to cast table
    await page.evaluate(() => window.scrollTo({ top: 900, behavior: "smooth" }));
    await wait(1500);
    await screenshot(page, "19-cast-table");

    // ═══════════════ Scene 9: Customer List ═══════════════
    console.log("📱 Scene 9: Customer list");
    await page.goto(`${BASE_URL}/store/customers`);
    await page.waitForSelector("text=顧客一覧");
    await wait(1500);
    await screenshot(page, "20-customer-list");

    // ═══════════════ Scene 10: Bottle Management ═══════════════
    console.log("📱 Scene 10: Bottle management");
    await page.goto(`${BASE_URL}/store/bottles`);
    await page.waitForSelector("text=ボトル管理");
    await wait(1500);
    await screenshot(page, "21-bottle-management");

    // ═══════════════ End ═══════════════
    console.log("📱 Scene 11: Back to role selector");
    await page.evaluate(() => localStorage.clear());
    await page.goto(BASE_URL);
    await page.waitForSelector("text=NIGHTOS");
    await wait(2000);
    await screenshot(page, "22-end");

  } catch (err) {
    console.error("❌ Demo script error:", err);
    await screenshot(page, "error-state");
  }

  // Close to flush the video
  await page.close();
  await context.close();
  await browser.close();

  console.log("");
  console.log("✅ Demo recording complete!");
  console.log(`   Video: ${OUTPUT_DIR}/`);
  console.log(`   Screenshots: ${SCREENSHOT_DIR}/`);
  console.log("");
  console.log("💡 Tips:");
  console.log("   - Convert .webm → .mp4: ffmpeg -i demo.webm -c:v libx264 demo.mp4");
  console.log("   - Or upload .webm directly to Slack/Discord/Google Drive");
}

async function screenshot(page: Page, name: string) {
  await page.screenshot({
    path: join(SCREENSHOT_DIR, `${name}.png`),
    fullPage: false,
  });
}

async function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
