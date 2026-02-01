/**
 * Next.js API Proxy Route
 * 
 * ARCHITECTURE:
 * - Auth & Profiles live in Supabase
 * - Business data lives in Neon (via Railway backend)
 * - Frontend NEVER talks to Railway directly
 * - All API calls go through this proxy to avoid CORS
 * 
 * Flow: Browser → /api/* → Railway Backend → Neon
 */

import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "https://locus-production-df4e.up.railway.app";

async function proxyRequest(request: NextRequest, path: string) {
  const url = `${BACKEND_URL}/api/${path}`;
  
  // Get authorization from request headers or cookies
  const authHeader = request.headers.get("authorization");
  
  // Build headers for backend request
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  
  if (authHeader) {
    headers["Authorization"] = authHeader;
  }

  // Get request body for non-GET requests
  let body: string | undefined;
  if (request.method !== "GET" && request.method !== "HEAD") {
    try {
      const text = await request.text();
      if (text) {
        body = text;
      }
    } catch {
      // No body
    }
  }

  // Forward query params
  const searchParams = request.nextUrl.searchParams.toString();
  const fullUrl = searchParams ? `${url}?${searchParams}` : url;

  console.log(`[Proxy] ${request.method} ${fullUrl}`);

  try {
    const response = await fetch(fullUrl, {
      method: request.method,
      headers,
      body,
      cache: "no-store",
    });

    // Get response data
    const contentType = response.headers.get("content-type");
    let data: string | ArrayBuffer;
    
    if (contentType?.includes("application/json")) {
      data = await response.text();
    } else {
      data = await response.arrayBuffer();
    }

    // Return proxied response
    return new NextResponse(data, {
      status: response.status,
      statusText: response.statusText,
      headers: {
        "Content-Type": contentType || "application/json",
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
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  return proxyRequest(request, path.join("/"));
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  return proxyRequest(request, path.join("/"));
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  return proxyRequest(request, path.join("/"));
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  return proxyRequest(request, path.join("/"));
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  return proxyRequest(request, path.join("/"));
}

export async function OPTIONS(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  // Handle preflight requests
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}
