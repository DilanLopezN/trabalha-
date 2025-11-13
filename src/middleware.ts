import { NextResponse, type NextRequest } from "next/server";
import { withAuth } from "next-auth/middleware";

/* -------------------- CONFIG -------------------- */
const CSRF_COOKIE_NAME = "csrf-token";
const CSRF_HEADER_NAME = "x-csrf-token";
const CSRF_SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_REQUESTS = 120;

const PUBLIC_PATHS = ["/auth", "/api/auth", "/api/payments/webhook"];

// Arquivos públicos reais
const PUBLIC_FILE =
  /\.(png|jpg|jpeg|gif|svg|ico|css|js|map|txt|xml|webp|woff2?)$/;

/* -------------------- STORE GLOBAL -------------------- */
type RateLimitRecord = {
  count: number;
  expiresAt: number;
};

declare global {
  // eslint-disable-next-line no-var
  var __rateLimitStore: Map<string, RateLimitRecord> | undefined;
}

const globalStore = globalThis as typeof globalThis & {
  __rateLimitStore?: Map<string, RateLimitRecord>;
};

const rateLimitStore =
  globalStore.__rateLimitStore ??
  (globalStore.__rateLimitStore = new Map<string, RateLimitRecord>());

/* -------------------- HELPERS -------------------- */
function isPublicPath(pathname: string) {
  if (PUBLIC_FILE.test(pathname)) return true;

  return PUBLIC_PATHS.some((publicPath) => {
    if (publicPath === "/") return pathname === "/";
    return pathname === publicPath || pathname.startsWith(`${publicPath}/`);
  });
}

function getClientIp(request: NextRequest) {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "anonymous"
  );
}

function applySecurityHeaders(response: NextResponse) {
  response.headers.set("X-Frame-Options", "SAMEORIGIN");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=()"
  );

  response.headers.set(
    "Content-Security-Policy",
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob:",
      "connect-src 'self' https://* ws://* wss://*",
      "font-src 'self' data:",
      "frame-ancestors 'self'",
      "form-action 'self'",
    ].join("; ")
  );

  if (process.env.NODE_ENV === "production") {
    response.headers.set(
      "Strict-Transport-Security",
      "max-age=63072000; includeSubDomains; preload"
    );
  }
}

function enforceRateLimit(request: NextRequest) {
  const identifier = getClientIp(request);
  const now = Date.now();
  const record = rateLimitStore.get(identifier);

  if (!record || record.expiresAt < now) {
    rateLimitStore.set(identifier, {
      count: 1,
      expiresAt: now + RATE_LIMIT_WINDOW_MS,
    });
    return null;
  }

  if (record.count >= RATE_LIMIT_MAX_REQUESTS) {
    const response = NextResponse.json(
      { error: "Too many requests" },
      { status: 429 }
    );
    response.headers.set(
      "Retry-After",
      String(Math.ceil(RATE_LIMIT_WINDOW_MS / 1000))
    );
    applySecurityHeaders(response);
    return response;
  }

  record.count += 1;
  return null;
}

function enforceCsrfProtection(request: NextRequest) {
  if (CSRF_SAFE_METHODS.has(request.method)) return null;

  const pathname = request.nextUrl.pathname;

  if (pathname.startsWith("/api/auth")) return null;

  const csrfCookie = request.cookies.get(CSRF_COOKIE_NAME)?.value;
  const csrfHeader = request.headers.get(CSRF_HEADER_NAME);
  const expectedOrigin = request.nextUrl.origin;
  const requestOrigin = request.headers.get("origin");
  const referer = request.headers.get("referer");
  const isSameOriginRequest =
    (requestOrigin && requestOrigin === expectedOrigin) ||
    (referer && referer.startsWith(expectedOrigin));

  if (!csrfCookie) {
    const response = NextResponse.json(
      { error: "Invalid CSRF token" },
      { status: 403 }
    );
    applySecurityHeaders(response);
    return response;
  }

  if (csrfHeader && csrfCookie === csrfHeader) {
    return null;
  }

  if (isSameOriginRequest) {
    return null;
  }

  if (!csrfHeader || csrfCookie !== csrfHeader) {
    const response = NextResponse.json(
      { error: "Invalid CSRF token" },
      { status: 403 }
    );
    applySecurityHeaders(response);
    return response;
  }

  return null;
}

function ensureCsrfCookie(request: NextRequest, response: NextResponse) {
  const hasToken = request.cookies.has(CSRF_COOKIE_NAME);

  if (!hasToken) {
    const token = crypto.randomUUID?.() ?? Math.random().toString(36).slice(2);

    response.cookies.set(CSRF_COOKIE_NAME, token, {
      httpOnly: false,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
      path: "/",
    });
  }
}

/* -------------------- MIDDLEWARE MAIN -------------------- */
const middleware = withAuth(
  function middleware(request) {
    const pathname = request.nextUrl.pathname;
    const rateLimitResponse = enforceRateLimit(request);
    if (rateLimitResponse) return rateLimitResponse;

    if (pathname === "/api/payments/webhook") {
      return NextResponse.next();
    }

    const csrfResponse = enforceCsrfProtection(request);
    if (csrfResponse) return csrfResponse;

    const response = NextResponse.next();

    ensureCsrfCookie(request, response);
    applySecurityHeaders(response);

    return response;
  },
  {
    callbacks: {
      authorized: ({ req, token }) => {
        const pathname = req.nextUrl.pathname;

        if (isPublicPath(pathname)) return true;

        return Boolean(token);
      },
    },
    pages: {
      signIn: "/auth/signin",
    },
  }
);

export default middleware;

/* -------------------- MATCHER -------------------- */
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)",
  ],
};
