"use client";

import { useState, useEffect } from "react";

const PHRASES = [
  "AI анализирует фото...",
  "анализируем кухню…",
  "ищем санузел…",
  "определяем тип жилья…",
];

export interface AiLoaderProps {
  /** Задержка между сменами фраз (мс) */
  interval?: number;
  className?: string;
}

/**
 * ТЗ №5: экран загрузки AI с текстом-анимацией.
 */
export function AiLoader({ interval = 1200, className }: AiLoaderProps) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const t = setInterval(() => {
      setIndex((i) => (i + 1) % PHRASES.length);
    }, interval);
    return () => clearInterval(t);
  }, [interval]);

  return (
    <div
      className={className}
      role="status"
      aria-live="polite"
      aria-label="Анализ фото"
    >
      <div className="w-10 h-10 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
      <p className="text-[15px] font-medium text-[var(--text-primary)] text-center">
        {PHRASES[index]}
      </p>
    </div>
  );
}
