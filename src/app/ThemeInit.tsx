"use client";

import { useEffect } from "react";

const THEME_KEY = "assembly_theme";

export function getStoredTheme(): "dark" | "light" {
  if (typeof window === "undefined") return "dark";
  const stored = localStorage.getItem(THEME_KEY);
  return stored === "light" ? "light" : "dark";
}

export function setStoredTheme(theme: "dark" | "light") {
  if (typeof window === "undefined") return;
  localStorage.setItem(THEME_KEY, theme);
  document.documentElement.dataset.theme = theme;
  window.dispatchEvent(new CustomEvent("theme-changed", { detail: theme }));
}

export default function ThemeInit() {
  useEffect(() => {
    const theme = getStoredTheme();
    document.documentElement.dataset.theme = theme;
    const onThemeChanged = () => {
      document.documentElement.dataset.theme = getStoredTheme();
    };
    window.addEventListener("theme-changed", onThemeChanged);
    return () => window.removeEventListener("theme-changed", onThemeChanged);
  }, []);
  return null;
}
