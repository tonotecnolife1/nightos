import { test, expect } from "@playwright/test";

/**
 * 03 — Insecure Direct Object Reference (IDOR) Tests
 *
 * Tests whether a logged-in user can access resources belonging to
 * other users or stores by manipulating IDs in URLs or request bodies.
 *
 * Critical risk: RLS is disabled on all tables (migrations 006-009),
 * so server-side code is the ONLY enforcement layer. These tests verify
 * that the application logic enforces ownership checks.
 */

// Mock cast IDs from lib/nightos/mock-data.ts
const CAST_AKARI = "cast1";          // あかり: store1 (CURRENT_STORE_ID)
const CAST_YUKI = "cast_oneesan2";   // ゆき: store1 (different cast, same store)
const CAST_CROSS_STORE = "cast3";    // りな: store2 (different store entirely)

test.describe("IDOR — Customer Record Access", () => {
  test.beforeEach(async ({ context }) => {
    await context.addCookies([
      {
        name: "nightos.mock-cast-id",
        value: CAST_AKARI,
        domain: "localhost",
        path: "/",
      },
    ]);
  });

  test("cast cannot access another cast's customer via URL ID manipulation", async ({
    page,
  }) => {
    // First navigate to own customers list to establish a valid session
    await page.goto("/cast/customers");
    const url = page.url();
    if (!url.includes("/cast/customers")) return; // redirect = already blocked

    // Attempt to access a specific customer by guessing/knowing another cast's customer ID
    // These are UUIDs in production, but we test the concept with mock IDs
    const foreignCustomerId = "customer-yuki-001"; // belongs to CAST_YUKI
    const response = await page.goto(`/cast/customers/${foreignCustomerId}`);

    if (response?.status() === 200) {
      // If page loads, verify it doesn't expose the foreign customer's data
      const content = await page.content();
      // Should not see another cast's customer data
      // In mock mode the data is scoped by cast_id — verify no foreign cast data shown
      expect(content).not.toContain(CAST_YUKI);
    } else {
      // 404 or redirect is the correct behaviour
      expect([404, 403, 302, 307]).toContain(response?.status());
    }
  });

  test("cast cannot access another cast's memo via API", async ({ page }) => {
    const response = await page.request.get(
      `/api/cast/memo?customerId=customer-yuki-001&castId=${CAST_YUKI}`,
      { failOnStatusCode: false },
    );
    // Must not return another cast's memo
    expect([401, 403, 404]).toContain(response.status());
  });
});

test.describe("IDOR — Cross-Store Data Access", () => {
  test.beforeEach(async ({ context }) => {
    await context.addCookies([
      {
        name: "nightos.mock-cast-id",
        value: CAST_AKARI,
        domain: "localhost",
        path: "/",
      },
    ]);
  });

  test("store dashboard does not expose data from other stores", async ({
    page,
  }) => {
    await page.goto("/store");
    const url = page.url();

    if (url.includes("/store")) {
      const content = await page.content();
      // Should not contain store IDs that don't belong to akari's store
      // In mock mode akari belongs to store-001; store-999 is foreign
      expect(content).not.toContain("store-999");
    }
  });

  test("customer list scoped to current cast's store only", async ({
    page,
  }) => {
    await page.goto("/cast/customers");
    const url = page.url();

    if (url.includes("/cast/customers")) {
      const content = await page.content();
      // Verify no customers from other stores appear (store isolation)
      // In mock data, each cast only sees customers from their own store
      expect(content).not.toContain("store-999");
    }
  });
});

test.describe("IDOR — Direct API Manipulation", () => {
  test.beforeEach(async ({ context }) => {
    await context.addCookies([
      {
        name: "nightos.mock-cast-id",
        value: CAST_AKARI,
        domain: "localhost",
        path: "/",
      },
    ]);
  });

  test("cannot update another cast's goal via API with forged castId", async ({
    page,
  }) => {
    // Attempt to set a goal for a different cast by sending their ID
    const response = await page.request.post("/api/store/set-cast-goal", {
      data: {
        castId: CAST_YUKI, // Foreign cast's ID
        salesGoal: 1,
        douhanGoal: 1,
        note: "IDOR attack",
      },
      failOnStatusCode: false,
    });
    expect([401, 403, 404, 405]).toContain(response.status());
  });

  test("AI chat history scoped to current cast", async ({ page }) => {
    // The /api/sakura-mama route should reject requests for other cast's history
    const response = await page.request.get(
      `/api/sakura-mama/history?castId=${CAST_YUKI}`,
      { failOnStatusCode: false },
    );
    // Either blocked entirely or returns empty (not CAST_YUKI's data)
    if (response.status() === 200) {
      const body = await response.json().catch(() => null);
      // If data is returned, it must not contain CAST_YUKI's chat history
      // with actual sensitive content
      if (Array.isArray(body)) {
        expect(body.length).toBe(0);
      }
    } else {
      expect([401, 403, 404]).toContain(response.status());
    }
  });

  test("bottle keep records cannot be read across stores", async ({ page }) => {
    // Try to access bottle data for a foreign customer
    const response = await page.request.get(
      "/api/cast/bottles?customerId=customer-store999-001",
      { failOnStatusCode: false },
    );
    expect([401, 403, 404]).toContain(response.status());
  });
});

test.describe("IDOR — URL Parameter Tampering", () => {
  test.beforeEach(async ({ context }) => {
    await context.addCookies([
      {
        name: "nightos.mock-cast-id",
        value: CAST_AKARI,
        domain: "localhost",
        path: "/",
      },
    ]);
  });

  test("douhan detail page rejects foreign douhan IDs", async ({ page }) => {
    const foreignDouhanId = "douhan-yuki-001";
    const response = await page.goto(
      `/cast/douhan/${foreignDouhanId}`,
    );
    if (response?.status() === 200) {
      const content = await page.content();
      // Must not show another cast's douhan data
      expect(content).not.toContain(CAST_YUKI);
    } else {
      expect([404, 403, 302, 307]).toContain(response?.status());
    }
  });

  test("LINE screenshot data not accessible cross-cast", async ({ page }) => {
    const response = await page.request.get(
      `/api/cast/line-screenshot?castId=${CAST_YUKI}&customerId=customer-001`,
      { failOnStatusCode: false },
    );
    expect([401, 403, 404]).toContain(response.status());
  });
});
