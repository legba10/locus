export const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function api(path: string, options?: RequestInit) {
  const res = await fetch(`${API_URL}${path}`, options);
  return res.json();
}

export async function getHealth() {
  return api("/health");
}
