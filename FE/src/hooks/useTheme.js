// src/hooks/useTheme.js
import { useEffect, useState } from "react";

export const THEME_KEY = "sap-theme";

export function getInitialTheme() {
  if (typeof window === "undefined") return "light";

  try {
    const stored = localStorage.getItem(THEME_KEY);
    if (stored === "light" || stored === "dark") return stored;

    const prefersDark = window.matchMedia
      ? window.matchMedia("(prefers-color-scheme: dark)").matches
      : false;

    return prefersDark ? "dark" : "light";
  } catch {
    return "light";
  }
}

export function useTheme() {
  const [theme, setTheme] = useState(getInitialTheme);

  // pasang / lepas class "dark" di <html> + simpan ke localStorage
  useEffect(() => {
    const root = document.documentElement;

    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }

    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch {
      // kalau localStorage error, abaikan saja
    }
  }, [theme]);

  // sinkron kalau ada perubahan dari tempat lain (misal dari Navbar)
  useEffect(() => {
    const stored = getInitialTheme();
    if (stored !== theme) setTheme(stored);
  }, []);

  const toggleTheme = () =>
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));

  return { theme, setTheme, toggleTheme };
}
