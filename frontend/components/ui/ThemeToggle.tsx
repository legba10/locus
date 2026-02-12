"use client";

import { useContext } from "react";
import { ThemeContext } from "@/providers/ThemeProvider";

export default function ThemeToggle() {
  const { theme, toggle } = useContext(ThemeContext);

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Toggle theme"
      className="theme-toggle"
      title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
    >
      {theme === "dark" ? "☀️" : "🌙"}
    </button>
  );
}
