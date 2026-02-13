"use client";

import { useContext } from "react";
import { ThemeContext } from "@/providers/ThemeProvider";
import { Moon, Sun } from "lucide-react";

export default function ThemeToggle() {
  const { resolvedTheme, toggle } = useContext(ThemeContext);

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Переключить тему"
      className="theme-toggle"
      title={resolvedTheme === "dark" ? "Светлая тема" : "Тёмная тема"}
    >
      <span className="theme-toggle-icon" aria-hidden>
        {resolvedTheme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
      </span>
    </button>
  );
}
