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
 */

import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL;

async function proxy(req: NextRequest, pathSegments: string[]) {
  if (!BACKEND_URL) {
    return NextResponse.json(
      { error: "NEXT_PUBLIC_API_URL not configured" },
      { status: 500 }
    );
  }

  // Build the backend URL
  const path = pathSegments.join("/");
  const url = `${BACKEND_URL}/api/${path}${req.nextUrl.search}`;

  console.log(`[Proxy] ${req.method} ${url}`);

  try {
    // Get body for non-GET requests
    let body: string | undefined;
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
      body: body || undefined,
    });

    // Get response body
    const contentType = res.headers.get("content-type") || "application/json";
    const data = await res.arrayBuffer();

    // Return proxied response
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

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  return proxy(req, path);
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  return proxy(req, path);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  return proxy(req, path);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  return proxy(req, path);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  return proxy(req, path);
}
