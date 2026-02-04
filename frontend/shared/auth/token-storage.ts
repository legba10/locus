const ACCESS_TOKEN_KEY = "locus_access_token";
const REFRESH_TOKEN_KEY = "locus_refresh_token";

function hasStorage(): boolean {
  return typeof window !== "undefined" && !!window.localStorage && !!window.sessionStorage;
}

export function setTokens(accessToken: string, refreshToken: string) {
  if (!hasStorage()) return;
  try {
    window.localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    window.localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    window.sessionStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    window.sessionStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  } catch {
    /* ignore storage errors */
  }
}

export function getAccessToken(): string | null {
  if (!hasStorage()) return null;
  try {
    return (
      window.localStorage.getItem(ACCESS_TOKEN_KEY) ??
      window.sessionStorage.getItem(ACCESS_TOKEN_KEY)
    );
  } catch {
    return null;
  }
}

export function getRefreshToken(): string | null {
  if (!hasStorage()) return null;
  try {
    return (
      window.localStorage.getItem(REFRESH_TOKEN_KEY) ??
      window.sessionStorage.getItem(REFRESH_TOKEN_KEY)
    );
  } catch {
    return null;
  }
}

export function clearTokens() {
  if (!hasStorage()) return;
  try {
    window.localStorage.removeItem(ACCESS_TOKEN_KEY);
    window.localStorage.removeItem(REFRESH_TOKEN_KEY);
    window.sessionStorage.removeItem(ACCESS_TOKEN_KEY);
    window.sessionStorage.removeItem(REFRESH_TOKEN_KEY);
  } catch {
    /* ignore storage errors */
  }
}
