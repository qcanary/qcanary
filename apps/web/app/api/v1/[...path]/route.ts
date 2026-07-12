import { auth } from "@clerk/nextjs/server";
import { NextResponse, type NextRequest } from "next/server";
import { EXCLUDED_PROJECT_IDS } from "@/lib/auth-constants";

function apiBaseUrl(): string | null {
  const raw = process.env.API_BASE_URL;
  if (!raw) return null;
  return raw.replace(/\/+$/, "");
}

function sanitizeUpstreamError(status: number, upstreamText: string): { message: string; code: string } {
  if (status >= 500) {
    return { message: "Internal server error", code: "UPSTREAM_ERROR" };
  }
  try {
    const parsed = JSON.parse(upstreamText);
    if (parsed?.error) {
      return {
        message: typeof parsed.error.message === "string" ? parsed.error.message : "Request failed",
        code: typeof parsed.error.code === "string" ? parsed.error.code : "REQUEST_ERROR",
      };
    }
  } catch {
    // Not JSON — use generic message
  }
  return { message: "Request failed", code: "REQUEST_ERROR" };
}

async function handler(req: NextRequest, context: { params: { path: string[] } }) {
  try {
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

    // Forward x-api-key if present (used by the ingest endpoint for test events)
    const apiKey = req.headers.get("x-api-key") ?? undefined;

    // 15-second timeout per upstream request — uses AbortController for Node 18+ compat
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15_000);

    try {
      const upstream = await fetch(targetUrl.toString(), {
        method: req.method,
        headers: {
          ...(contentType ? { "content-type": contentType } : {}),
          authorization: `Bearer ${token}`,
          ...(apiKey ? { "x-api-key": apiKey } : {}),
        },
        body,
        cache: "no-store",
        signal: controller.signal,
      });

      const upstreamText = await upstream.text();

      // Sanitize upstream errors: preserve original error code + message for 4xx,
      // only mask internal details for 5xx
      let responseBody = upstreamText;
      let responseStatus = upstream.status;

      if (!upstream.ok) {
        const { message, code } = sanitizeUpstreamError(upstream.status, upstreamText);
        responseBody = JSON.stringify({
          success: false,
          error: { code, message },
        });
        // Pass through 4xx status codes, only mask 5xx as 502
        if (upstream.status >= 500) {
          responseStatus = 502;
        }
      }

      const response = new NextResponse(responseBody, {
        status: responseStatus,
        headers: {
          "content-type": upstream.headers.get("content-type") ?? "application/json; charset=utf-8",
        },
      });

      return response;
    } finally {
      clearTimeout(timeoutId);
    }
  } catch (err) {
    // Log the full error server-side but only send a sanitized generic message to the client
    if (err instanceof Error) {
      // eslint-disable-next-line no-console
      console.error("[PROXY ERROR]", err.message);
    }
    return NextResponse.json(
      { success: false, error: { code: "PROXY_ERROR", message: "Upstream service unreachable" } },
      { status: 502 }
    );
  }
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
