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

async function handleProxy(req: NextRequest, pathSegments: string[]) {
  if (!BACKEND_URL) {
    return NextResponse.json(
      { error: "NEXT_PUBLIC_API_URL not set" },
      { status: 500 }
    );
  }

  // Build backend path: /api/{path}
  // Backend uses setGlobalPrefix("api"), so routes are at /api/...
  const path = pathSegments.join("/");
  const url = `${BACKEND_URL}/api/${path}${req.nextUrl.search}`;

  console.log(`[Proxy] ${req.method} ${url}`);

  try {
    // Prepare body for non-GET requests
    let body: string | undefined = undefined;
    if (req.method !== "GET" && req.method !== "HEAD") {
      try {
        body = await req.text();
      } catch {
        // No body
      }
    }

    // Forward request to backend
    const res = await fetch(url, {
      method: req.method,
      headers: {
        "Content-Type": "application/json",
        Authorization: req.headers.get("authorization") ?? "",
      },
      body,
    });

    // Get response
    const data = await res.arrayBuffer();
    const contentType = res.headers.get("content-type") ?? "application/json";

    return new NextResponse(data, {
      status: res.status,
      headers: {
        "Content-Type": contentType,
      },
    });
  } catch (error) {
    console.error("[Proxy] Error:", error);
    return NextResponse.json(
      { error: "Backend unavailable", message: String(error) },
      { status: 502 }
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
