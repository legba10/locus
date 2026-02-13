/**
 * Next.js API Proxy
 * 
 * IMPORTANT:
 * - Auth & Profiles live in Supabase
 * - Business data lives in Neon
 * - Frontend NEVER talks to Neon directly
 * - All API calls go through Next.js API layer to avoid CORS
 * 
 * Flow: Browser → /api/* → Railway Backend → Neon
 * 
 * Mapping:
 * - /api/listings → BACKEND_URL/api/listings
 * - /api/auth/me → BACKEND_URL/api/auth/me
 */

import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL;
const ACCESS_TOKEN_COOKIE = "locus_access_token";
const PROXY_TIMEOUT_MS = 20_000;

function readCookie(cookieHeader: string | null, name: string): string | null {
  if (!cookieHeader) return null;
  const parts = cookieHeader.split(";").map((p) => p.trim());
  for (const p of parts) {
    if (!p) continue;
    const idx = p.indexOf("=");
    if (idx === -1) continue;
    const k = p.slice(0, idx);
    if (k === name) return decodeURIComponent(p.slice(idx + 1));
  }
  return null;
}

async function handleProxy(req: NextRequest, pathSegments: string[]) {
  if (!BACKEND_URL) {
    return NextResponse.json(
      { error: "NEXT_PUBLIC_API_URL not set" },
      { status: 500 }
    );
  }

  // Build backend path: /api/{path}
  const path = pathSegments.join("/");
  const url = `${BACKEND_URL}/api/${path}${req.nextUrl.search}`;

  const contentType = req.headers.get("content-type") || "";
  const isMultipart = contentType.includes("multipart/form-data");

  try {
    // Prepare headers
    const headers: Record<string, string> = {
      // Forward cookies so backend can set/read them (auth session)
      Cookie: req.headers.get("cookie") ?? "",
    };

    const incomingAuth = req.headers.get("authorization");
    if (incomingAuth) {
      headers["Authorization"] = incomingAuth;
    } else {
      // Cookie-based session: inject Authorization for backend guards
      const access = readCookie(req.headers.get("cookie"), ACCESS_TOKEN_COOKIE);
      if (access) headers["Authorization"] = `Bearer ${access}`;
    }

    // Prepare body for non-GET requests
    let body: BodyInit | undefined = undefined;
    
    if (req.method !== "GET" && req.method !== "HEAD") {
      if (isMultipart) {
        // For file uploads: pass FormData directly
        // Important: DO NOT set Content-Type - fetch will set it with boundary
        body = await req.formData();
      } else {
        // For JSON requests
        headers["Content-Type"] = "application/json";
        try {
          body = await req.text();
        } catch {
          // No body
        }
      }
    } else {
      // GET requests - still set Content-Type for consistency
      headers["Content-Type"] = "application/json";
    }

    // Forward request to backend
    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), PROXY_TIMEOUT_MS);
    let res: Response;
    try {
      res = await fetch(url, {
        method: req.method,
        headers,
        body,
        signal: controller.signal,
      });
    } finally {
      clearTimeout(t);
    }

    // Get response
    const data = await res.arrayBuffer();
    const responseContentType = res.headers.get("content-type") ?? "application/json";

    const nextRes = new NextResponse(data, {
      status: res.status,
      headers: {
        "Content-Type": responseContentType,
      },
    });

    // Forward Set-Cookie headers from backend (critical for httpOnly session cookies)
    const anyHeaders = res.headers as any;
    const setCookies: string[] | undefined =
      typeof anyHeaders.getSetCookie === "function"
        ? anyHeaders.getSetCookie()
        : (res.headers.get("set-cookie") ? [res.headers.get("set-cookie") as string] : undefined);

    if (setCookies) {
      for (const c of setCookies) {
        if (c) nextRes.headers.append("set-cookie", c);
      }
    }

    return nextRes;
  } catch (error) {
    console.error("[Proxy] Error:", error);
    const isTimeout = error instanceof DOMException && error.name === "AbortError";
    return NextResponse.json(
      { error: isTimeout ? "Proxy timeout" : "Backend unavailable", message: String(error) },
      { status: isTimeout ? 504 : 502 }
    );
  }
}

// Export all HTTP methods
// Next.js 15 uses Promise<params> - we await it in handler
type RouteContext = { params: Promise<{ path: string[] }> };

export async function GET(req: NextRequest, context: RouteContext) {
  const { path } = await context.params;
  return handleProxy(req, path);
}

export async function POST(req: NextRequest, context: RouteContext) {
  const { path } = await context.params;
  return handleProxy(req, path);
}

export async function PUT(req: NextRequest, context: RouteContext) {
  const { path } = await context.params;
  return handleProxy(req, path);
}

export async function PATCH(req: NextRequest, context: RouteContext) {
  const { path } = await context.params;
  return handleProxy(req, path);
}

export async function DELETE(req: NextRequest, context: RouteContext) {
  const { path } = await context.params;
  return handleProxy(req, path);
}
