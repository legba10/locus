"use client";

import { createContext, useCallback, useEffect, useMemo, useState } from "react";

/** ТЗ-1: 3 режима — light, dark, system (по устройству) */
export type Theme = "light" | "dark" | "system";

export type ResolvedTheme = "light" | "dark";

type ThemeContextValue = {
  theme: Theme;
  resolvedTheme: ResolvedTheme;
  setTheme: (t: Theme) => void;
  toggle: () => void;
};

export const ThemeContext = createContext<ThemeContextValue>({
  theme: "light",
  resolvedTheme: "light",
  setTheme: () => {},
  toggle: () => {},
});

function getSystemTheme(): ResolvedTheme {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function applyTheme(resolved: ResolvedTheme) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.classList.remove("light", "dark");
  root.classList.add(resolved);
  root.setAttribute("data-theme", resolved);
  root.style.colorScheme = resolved;
}

/** ТЗ-1: начальная тема — скрипт в layout выставил data-theme; избегаем hydration mismatch */
function getInitialTheme(): Theme {
  if (typeof document === "undefined") return "light";
  const t = document.documentElement.getAttribute("data-theme");
  if (t === "dark" || t === "light") return t;
  const saved = typeof localStorage !== "undefined" ? localStorage.getItem("theme") : null;
  if (saved === "dark" || saved === "light" || saved === "system") return saved;
  return "system";
}

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(getInitialTheme);
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>(() =>
    typeof document !== "undefined"
      ? (document.documentElement.getAttribute("data-theme") as ResolvedTheme) || getSystemTheme()
      : "light"
  );

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    const mode: Theme = saved === "dark" || saved === "light" || saved === "system" ? saved : "system";
    setThemeState(mode);
    const resolved = mode === "system" ? getSystemTheme() : mode;
    setResolvedTheme(resolved);
    applyTheme(resolved);
    if (saved !== mode) localStorage.setItem("theme", mode);
  }, []);

  useEffect(() => {
    if (theme !== "system") return;
    const resolved = getSystemTheme();
    setResolvedTheme(resolved);
    applyTheme(resolved);
    const m = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => {
      const r: ResolvedTheme = m.matches ? "dark" : "light";
      setResolvedTheme(r);
      applyTheme(r);
    };
    m.addEventListener("change", handler);
    return () => m.removeEventListener("change", handler);
  }, [theme]);

  const setTheme = useCallback((t: Theme) => {
    setThemeState(t);
    const resolved = t === "system" ? getSystemTheme() : t;
    setResolvedTheme(resolved);
    applyTheme(resolved);
    localStorage.setItem("theme", t);
  }, []);

  const toggle = useCallback(() => {
    setThemeState((prev) => {
      const currentResolved = prev === "system" ? getSystemTheme() : prev;
      const next: Theme = currentResolved === "dark" ? "light" : "dark";
      const r: ResolvedTheme = next;
      setResolvedTheme(r);
      applyTheme(r);
      localStorage.setItem("theme", next);
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({ theme, resolvedTheme, setTheme, toggle }),
    [theme, resolvedTheme, setTheme, toggle]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
