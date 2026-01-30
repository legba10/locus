function getApiUrl(): string {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) {
    throw new Error("NEXT_PUBLIC_API_URL is missing");
  }
  return apiUrl;
}

export async function api(path: string, options?: RequestInit) {
  const apiUrl = getApiUrl();
  const res = await fetch(`${apiUrl}${path}`, options);
  return res.json();
}

export async function getHealth() {
  return api("/health");
}
