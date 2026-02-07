import type { Request, Response } from "express";

export const ACCESS_TOKEN_COOKIE = "locus_access_token";
export const REFRESH_TOKEN_COOKIE = "locus_refresh_token";

type SameSite = "lax" | "strict" | "none";

function isHttps(req?: Request): boolean {
  const proto = req?.headers?.["x-forwarded-proto"];
  if (typeof proto === "string") return proto.toLowerCase() === "https";
  return process.env.NODE_ENV === "production";
}

function getCookieDomain(): string | undefined {
  const d = process.env.COOKIE_DOMAIN?.trim();
  if (!d) return undefined;
  return d;
}

function baseOptions(req?: Request) {
  const domain = getCookieDomain();
  const secure = isHttps(req);

  return {
    httpOnly: true,
    secure,
    sameSite: "lax" as SameSite,
    path: "/",
    ...(domain ? { domain } : {}),
  };
}

export function setAuthCookies(
  res: Response,
  req: Request | undefined,
  tokens: { access_token: string; refresh_token: string }
) {
  // Supabase access tokens are short-lived; refresh token is long-lived.
  const accessMaxAgeMs = 60 * 60 * 1000; // 1h
  const refreshMaxAgeMs = 30 * 24 * 60 * 60 * 1000; // 30d

  res.cookie(ACCESS_TOKEN_COOKIE, tokens.access_token, {
    ...baseOptions(req),
    maxAge: accessMaxAgeMs,
  });

  res.cookie(REFRESH_TOKEN_COOKIE, tokens.refresh_token, {
    ...baseOptions(req),
    maxAge: refreshMaxAgeMs,
  });
}

export function clearAuthCookies(res: Response, req?: Request) {
  const opts = baseOptions(req);
  res.clearCookie(ACCESS_TOKEN_COOKIE, opts);
  res.clearCookie(REFRESH_TOKEN_COOKIE, opts);
}

export function readRefreshTokenFromCookie(req: Request): string | null {
  const v = (req as any)?.cookies?.[REFRESH_TOKEN_COOKIE];
  return typeof v === "string" && v.length > 0 ? v : null;
}

