import { auth } from "@clerk/nextjs/server";
import { NextResponse, type NextRequest } from "next/server";
import { EXCLUDED_PROJECT_IDS } from "@/lib/auth-constants";

function apiBaseUrl(): string | null {
  const raw = process.env.API_BASE_URL;
  if (!raw) return null;
  return raw.replace(/\/+$/, "");
}

async function handler(req: NextRequest, context: { params: { path: string[] } }) {
  const base = apiBaseUrl();
  if (!base) {
    return NextResponse.json(
      { success: false, error: { code: "CONFIG_ERROR", message: "Missing API_BASE_URL" } },
      { status: 500 }
    );
  }

  // Defense-in-depth: reject requests containing Clerk auth route segments
  if (Array.isArray(context.params.path) && context.params.path.some((segment) => EXCLUDED_PROJECT_IDS.has(segment))) {
    return NextResponse.json(
      { success: false, error: { code: "NOT_FOUND", message: "Not found" } },
      { status: 404 }
    );
  }

  // Use client-provided Authorization header if present (e.g., from useAuth()),
  // otherwise fall back to server-side auth().getToken()
  let token = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ?? null;
  if (!token) {
    const authResult = await auth();
    token = await authResult.getToken() ?? null;
  }

  if (!token) {
    return NextResponse.json(
      { success: false, error: { code: "UNAUTHORIZED", message: "Unauthorized" } },
      { status: 401 }
    );
  }

  const path = Array.isArray(context.params.path) ? context.params.path.join("/") : "";
  const targetUrl = new URL(`${base}/v1/${path}`);
  req.nextUrl.searchParams.forEach((value, key) => {
    targetUrl.searchParams.set(key, value);
  });

  const contentType = req.headers.get("content-type") ?? undefined;
  const body =
    req.method === "GET" || req.method === "HEAD"
      ? undefined
      : await req.text();

  const upstream = await fetch(targetUrl.toString(), {
    method: req.method,
    headers: {
      ...(contentType ? { "content-type": contentType } : {}),
      authorization: `Bearer ${token}`,
    },
    body,
    cache: "no-store",
  });

  const upstreamText = await upstream.text();
  const response = new NextResponse(upstreamText, {
    status: upstream.status,
    headers: {
      "content-type": upstream.headers.get("content-type") ?? "application/json; charset=utf-8",
    },
  });

  return response;
}

export async function GET(req: NextRequest, context: { params: { path: string[] } }) {
  return handler(req, context);
}
export async function POST(req: NextRequest, context: { params: { path: string[] } }) {
  return handler(req, context);
}
export async function PATCH(req: NextRequest, context: { params: { path: string[] } }) {
  return handler(req, context);
}
export async function DELETE(req: NextRequest, context: { params: { path: string[] } }) {
  return handler(req, context);
}

