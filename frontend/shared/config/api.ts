/**
 * ЕДИНСТВЕННЫЙ источник API URL.
 * Backend: Railway. Render исключён.
 * 
 * ЗАПРЕЩЕНО: replace, trim слэшей, авто-нормализация URL
 */

export const API_URL = process.env.NEXT_PUBLIC_API_URL!;

/**
 * Строит полный URL для backend API.
 * path должен начинаться с /api/
 * Пример: getApiUrl('/api/listings') → https://backend.railway.app/api/listings
 */
export function getApiUrl(path: string): string {
  if (!API_URL) {
    throw new Error("NEXT_PUBLIC_API_URL is not configured");
  }
  // Простая конкатенация без манипуляций
  return `${API_URL}${path}`;
}
