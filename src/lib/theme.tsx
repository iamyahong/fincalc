import React, { createContext, useContext, useState, useEffect } from "react";

export type Theme = "light" | "dark";
export type FontSize = "small" | "medium" | "large";

interface ThemeContextValue {
  theme: Theme;
  setTheme: (t: Theme) => void;
  fontSize: FontSize;
  setFontSize: (f: FontSize) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

function getInitialTheme(): Theme {
  if (typeof window === "undefined") return "light";
  const stored = localStorage.getItem("theme") as Theme | null;
  if (stored === "light" || stored === "dark") return stored;
  if (window.matchMedia("(prefers-color-scheme: dark)").matches) return "dark";
  return "light";
}

function getInitialFontSize(): FontSize {
  if (typeof window === "undefined") return "medium";
  const stored = localStorage.getItem("fontSize") as FontSize | null;
  if (stored === "small" || stored === "medium" || stored === "large") return stored;
  return "medium";
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(getInitialTheme);
  const [fontSize, setFontSizeState] = useState<FontSize>(getInitialFontSize);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("text-sm", "text-base", "text-lg");
    if (fontSize === "small") root.classList.add("text-sm");
    else if (fontSize === "large") root.classList.add("text-lg");
    else root.classList.add("text-base");
    localStorage.setItem("fontSize", fontSize);
  }, [fontSize]);

  function setTheme(t: Theme) {
    setThemeState(t);
  }

  function setFontSize(f: FontSize) {
    setFontSizeState(f);
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme, fontSize, setFontSize }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used inside ThemeProvider");
  return ctx;
}
