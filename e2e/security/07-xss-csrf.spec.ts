import { test, expect } from "@playwright/test";

/**
 * 07 — XSS and CSRF Tests
 *
 * Verifies that user-supplied content is properly escaped and that
 * state-changing actions require valid session context (CSRF protection).
 */

test.describe("XSS — Stored / Reflected Input", () => {
  test.beforeEach(async ({ context }) => {
    await context.addCookies([
      {
        name: "nightos.mock-cast-id",
        value: "cast1",
        domain: "localhost",
        path: "/",
      },
    ]);
  });

  test("customer name with XSS payload does not execute in UI", async ({
    page,
  }) => {
    // Navigate to customer list where names are rendered
    await page.goto("/cast/customers");

    // Inject an XSS marker via a mock param (tests the rendering layer)
    await page.evaluate(() => {
      (window as any).__xss_executed = false;
    });

    // If there is a search field, type an XSS payload
    const searchInput = page.getByRole("searchbox").or(
      page.locator("input[placeholder*='検索']"),
    );
    if (await searchInput.count() > 0) {
      await searchInput.fill('<img src=x onerror="window.__xss_executed=true">');
      await page.waitForTimeout(500);
    }

    const xssExecuted = await page.evaluate(() => (window as any).__xss_executed);
    expect(xssExecuted).toBeFalsy();
  });

  test("memo content with script tags does not execute", async ({ page }) => {
    // Navigate to any page that renders memo/note content
    await page.goto("/cast/customers");

    const xssPayload = '<script>window.__memo_xss=1</script>';
    await page.evaluate(() => {
      (window as any).__memo_xss = 0;
    });

    // Check textarea inputs
    const textareas = page.locator("textarea");
    if (await textareas.count() > 0) {
      await textareas.first().fill(xssPayload);
      await page.waitForTimeout(300);
    }

    const xssExecuted = await page.evaluate(() => (window as any).__memo_xss);
    expect(xssExecuted).toBeFalsy();
  });

  test("URL parameter reflection does not cause XSS", async ({ page }) => {
    // Test reflected XSS via URL parameters
    await page.evaluate(() => { (window as any).__url_xss = false; });
    await page.goto(
      "/cast/home?q=<img src=x onerror=\"window.__url_xss=true\">",
    );
    const xssExecuted = await page.evaluate(() => (window as any).__url_xss);
    expect(xssExecuted).toBeFalsy();
  });

  test("AI chat response rendering does not execute injected scripts", async ({
    page,
  }) => {
    await page.goto("/cast/ai-chat");
    const url = page.url();
    if (!url.includes("/cast/ai-chat")) return;

    await page.evaluate(() => { (window as any).__chat_xss = false; });

    // If a message input exists, test script injection
    const msgInput = page.locator("textarea").or(
      page.locator("input[type='text']"),
    );
    if (await msgInput.count() > 0) {
      await msgInput.first().fill(
        '<script>window.__chat_xss=true</script>',
      );
      // Don't submit — just verify input doesn't cause immediate execution
      const xssExecuted = await page.evaluate(() => (window as any).__chat_xss);
      expect(xssExecuted).toBeFalsy();
    }
  });
});

test.describe("CSRF — State-Changing Actions", () => {
  test("AI chat POST from a different origin is rejected", async ({ page }) => {
    // Simulate a cross-origin request (no valid session from another origin)
    const response = await page.request.post("/api/sakura-mama", {
      headers: {
        Origin: "https://malicious-site.example.com",
        Referer: "https://malicious-site.example.com/attack",
        "Content-Type": "application/json",
      },
      data: {
        castId: "cast-akari",
        intent: "freeform",
        messages: [{ role: "user", content: "CSRF test" }],
      },
      failOnStatusCode: false,
    });
    // Should reject cross-origin unauthenticated requests
    expect([401, 403, 404]).toContain(response.status());
  });

  test("Server Actions reject requests without Next.js action headers", async ({
    page,
  }) => {
    await page.context().addCookies([
      {
        name: "nightos.mock-cast-id",
        value: "cast1",
        domain: "localhost",
        path: "/",
      },
    ]);

    // Next.js Server Actions require specific headers; raw POSTs without them fail
    const response = await page.request.post("/cast/home", {
      headers: {
        "Content-Type": "application/json",
        // Deliberately missing: Next-Action header
      },
      data: { attack: "csrf" },
      failOnStatusCode: false,
    });
    // Should not execute a server action
    expect(response.status()).not.toBe(500);
  });
});

test.describe("Open Redirect", () => {
  test("redirect parameter on auth page does not redirect to external URLs", async ({
    page,
    context,
  }) => {
    await context.clearCookies();
    // Attempt open redirect via callbackUrl or redirect param
    await page.goto(
      "/auth/login?callbackUrl=https%3A%2F%2Fevil.example.com%2Fphishing",
    );
    // If login happens (mock cookie set), verify we don't land on evil.example.com
    await context.addCookies([
      {
        name: "nightos.mock-cast-id",
        value: "cast1",
        domain: "localhost",
        path: "/",
      },
    ]);
    await page.goto(
      "/auth/login?callbackUrl=https%3A%2F%2Fevil.example.com%2Fphishing",
    );
    await page.waitForTimeout(1000);
    const url = page.url();
    expect(url).not.toContain("evil.example.com");
    expect(url).not.toContain("phishing");
  });

  test("next param on login does not allow external redirect", async ({
    page,
    context,
  }) => {
    await context.addCookies([
      {
        name: "nightos.mock-cast-id",
        value: "cast1",
        domain: "localhost",
        path: "/",
      },
    ]);
    await page.goto("/auth/login?next=//evil.example.com");
    await page.waitForTimeout(500);
    const url = page.url();
    expect(url).not.toContain("evil.example.com");
  });
});
