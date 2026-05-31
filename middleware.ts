import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const PUBLIC_PATHS = [
  "/auth/",
  "/cast/auth/",
  "/store/auth/",
  "/customer/auth/",
  "/api/",
  "/docs/",
  "/pitch",
  "/setup",
  "/legal/",
  "/demo",
];

function mockAuthDisabled(): boolean {
  const v = process.env.NIGHTOS_DISABLE_MOCK_AUTH;
  return v === "true" || v === "1";
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p)) || pathname === "/") {
    return NextResponse.next();
  }

  // Mock cast cookie is only honored when mock auth is enabled.
  if (!mockAuthDisabled()) {
    const hasMockSession = !!request.cookies.get("nightos.mock-cast-id")?.value;
    if (hasMockSession) {
      return NextResponse.next();
    }
  }

  // When Supabase is configured, use a middleware client to refresh the
  // session on every request. This writes updated tokens back to cookies
  // so the session persists beyond the 1-hour access token lifetime.
  if (
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    let response = NextResponse.next({ request });

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
            cookiesToSet.forEach(({ name, value }) =>
              request.cookies.set(name, value),
            );
            response = NextResponse.next({ request });
            cookiesToSet.forEach(({ name, value, options }) =>
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              response.cookies.set(name, value, options as any),
            );
          },
        },
      },
    );

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      return response;
    }

    const loginPath = pathname.startsWith("/store")
      ? "/store/auth/login"
      : pathname.startsWith("/customer")
        ? "/customer/auth/login"
        : "/cast/auth/login";
    const loginUrl = new URL(loginPath, request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Supabase not configured (local dev without env vars) — fall back to
  // checking raw cookie names so the mock-auth flow still works.
  const hasSupabaseSession =
    !!request.cookies.get("sb-access-token")?.value ||
    Array.from(request.cookies.getAll()).some(
      (c) => c.name.startsWith("sb-") && c.name.includes("auth-token"),
    );

  if (!hasSupabaseSession) {
    const loginPath = pathname.startsWith("/store")
      ? "/store/auth/login"
      : pathname.startsWith("/customer")
        ? "/customer/auth/login"
        : "/cast/auth/login";
    const loginUrl = new URL(loginPath, request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // sw.js / offline.html / manifest.json は認証リダイレクトに巻き込むと
    // Service Worker の登録やオフライン配信が壊れるため必ず除外する。
    "/((?!_next/static|_next/image|favicon.ico|images/|sw.js|offline.html|manifest.json|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
