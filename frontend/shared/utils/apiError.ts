/**
 * Обработка ошибок API — любая ошибка API → понятное сообщение для пользователя.
 */

const STATUS_MESSAGES: Record<number, string> = {
  400: "Неверный запрос. Проверьте введённые данные.",
  401: "Требуется авторизация. Войдите в аккаунт.",
  403: "Доступ запрещён.",
  404: "Данные не найдены.",
  408: "Превышено время ожидания. Попробуйте позже.",
  409: "Конфликт данных. Возможно, запись уже изменена.",
  422: "Данные не прошли проверку. Исправьте и попробуйте снова.",
  429: "Слишком много запросов. Подождите немного.",
  500: "Ошибка сервера. Попробуйте позже.",
  502: "Сервис временно недоступен. Попробуйте позже.",
  503: "Сервис временно недоступен. Попробуйте позже.",
  504: "Превышено время ожидания ответа сервера.",
};

/**
 * Сообщения, которые не показывать пользователю (заменяем на понятные).
 * ТЗ-4: "Application not found" и подобные — заменяем на "Ошибка публикации".
 */
const REPLACE_MESSAGES: Array<{ pattern: RegExp; replacement: string }> = [
  { pattern: /application\s+not\s+found/i, replacement: "Ошибка публикации. Проверьте подключение к серверу." },
  { pattern: /cannot\s+(get|post|put|patch|delete)\s+/i, replacement: "Ошибка сервера. Попробуйте позже." },
];

/**
 * Возвращает понятное сообщение для пользователя по коду ответа или тексту ошибки.
 */
export function getApiErrorMessage(status: number, serverMessage?: string): string {
  let msg = serverMessage?.trim() ?? "";
  if (msg.length > 0 && msg.length < 200) {
    for (const { pattern, replacement } of REPLACE_MESSAGES) {
      if (pattern.test(msg)) return replacement;
    }
    return msg;
  }
  return STATUS_MESSAGES[status] ?? `Ошибка запроса (${status}). Попробуйте позже.`;
}

/**
 * Извлечь сообщение из ответа API (JSON с полем message или error).
 */
export function parseApiErrorPayload(payload: unknown): string | undefined {
  if (payload && typeof payload === "object") {
    const obj = payload as { message?: string; error?: string };
    return obj.message ?? obj.error;
  }
  return undefined;
}
