"use client";

import { useContext } from "react";
import { ThemeContext } from "@/providers/ThemeProvider";
import { Moon, Sun } from "lucide-react";

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
      {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}
