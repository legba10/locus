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
 * Возвращает понятное сообщение для пользователя по коду ответа или тексту ошибки.
 */
export function getApiErrorMessage(status: number, serverMessage?: string): string {
  if (serverMessage && serverMessage.trim().length > 0 && serverMessage.length < 200) {
    return serverMessage;
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
