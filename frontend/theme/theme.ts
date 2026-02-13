/**
 * TZ-4: единые токены темы. Использовать только через CSS var(--bg), var(--card) и т.д.
 * Не использовать inline — только global theme tokens.
 */

export const lightTheme = {
  bg: "#ffffff",
  bgSecondary: "#f5f6f8",
  card: "#ffffff",
  text: "#0f172a",
  textSecondary: "#64748b",
  border: "#e5e7eb",
  accent: "#7c3aed",
} as const

export const darkTheme = {
  bg: "#0b0f1a",
  bgSecondary: "#111827",
  card: "#0f172a",
  text: "#ffffff",
  textSecondary: "#9ca3af",
  border: "#1f2937",
  accent: "#8b5cf6",
} as const
