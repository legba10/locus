"use client";

import { useState, useCallback } from "react";

/**
 * TZ-5: Хук для кнопок с асинхронным действием.
 * Устанавливает aria-busy и блокирует повторные клики на время выполнения.
 */
export function useLoadingButton<T extends unknown[]>(
  asyncAction: (...args: T) => Promise<void>
) {
  const [busy, setBusy] = useState(false);

  const handleClick = useCallback(
    async (...args: T) => {
      if (busy) return;
      setBusy(true);
      try {
        await asyncAction(...args);
      } finally {
        setBusy(false);
      }
    },
    [asyncAction, busy]
  );

  return { busy, handleClick };
}
