"use client";

import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

export default function ThemeToggle() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    const saved = localStorage.getItem("pf_theme") as "dark" | "light" | null;
    if (saved) {
      setTheme(saved);
      document.documentElement.classList.toggle("light", saved === "light");
    } else {
      document.documentElement.classList.remove("light");
    }
  }, []);

  const toggle = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    localStorage.setItem("pf_theme", next);
    document.documentElement.classList.toggle("light", next === "light");
  };

  return (
    <button
      onClick={toggle}
      aria-label="Toggle Dark and Light theme"
      className="p-2 rounded-full border border-navy-600 bg-navy-700/60 hover:border-brand-500 text-slate-300 hover:text-white transition-all"
    >
      {theme === "dark" ? (
        <Sun className="w-4 h-4 text-amber-400" />
      ) : (
        <Moon className="w-4 h-4 text-indigo-400" />
      )}
    </button>
  );
}
