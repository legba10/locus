"use client";

import { useContext } from "react";
import { ThemeContext } from "@/providers/ThemeProvider";

/**
 * ТЗ-4: useTheme() — SSR-safe, без доступа к window до mount.
 * Хранение в localStorage и переключение без полного перерендера — в ThemeProvider.
 */
export function useTheme() {
  return useContext(ThemeContext);
}
