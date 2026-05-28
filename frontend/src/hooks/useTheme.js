import { useState, useEffect, useCallback } from "react";

const THEMES = {
  netflix: {
    name: "Netflix Đỏ",
    icon: "🔴",
    vars: {
      "--red": "#e50914",
      "--red-dark": "#b20710",
      "--red-glow": "rgba(229,9,20,0.25)",
      "--bg": "#0a0a0a",
      "--bg-card": "#141414",
      "--bg-elevated": "#1c1c1c",
      "--bg-hover": "#222222",
      "--border": "rgba(255,255,255,0.07)",
      "--border-hover": "rgba(255,255,255,0.15)",
    },
  },
  emerald: {
    name: "Lục Bảo",
    icon: "💚",
    vars: {
      "--red": "#10b981",
      "--red-dark": "#059669",
      "--red-glow": "rgba(16,185,129,0.25)",
      "--bg": "#0a0f0a",
      "--bg-card": "#111a15",
      "--bg-elevated": "#1a2520",
      "--bg-hover": "#202b25",
      "--border": "rgba(255,255,255,0.06)",
      "--border-hover": "rgba(255,255,255,0.14)",
    },
  },
  ocean: {
    name: "Đại Dương",
    icon: "🔵",
    vars: {
      "--red": "#3b82f6",
      "--red-dark": "#2563eb",
      "--red-glow": "rgba(59,130,246,0.25)",
      "--bg": "#0a0a12",
      "--bg-card": "#12121e",
      "--bg-elevated": "#1a1a2e",
      "--bg-hover": "#222238",
      "--border": "rgba(255,255,255,0.06)",
      "--border-hover": "rgba(255,255,255,0.14)",
    },
  },
  royal: {
    name: "Hoàng Gia",
    icon: "💜",
    vars: {
      "--red": "#8b5cf6",
      "--red-dark": "#7c3aed",
      "--red-glow": "rgba(139,92,246,0.25)",
      "--bg": "#0a0a12",
      "--bg-card": "#14111e",
      "--bg-elevated": "#1c1830",
      "--bg-hover": "#242040",
      "--border": "rgba(255,255,255,0.06)",
      "--border-hover": "rgba(255,255,255,0.14)",
    },
  },
  midnight: {
    name: "Nửa Đêm",
    icon: "🌙",
    vars: {
      "--red": "#f59e0b",
      "--red-dark": "#d97706",
      "--red-glow": "rgba(245,158,11,0.25)",
      "--bg": "#030712",
      "--bg-card": "#111827",
      "--bg-elevated": "#1f2937",
      "--bg-hover": "#374151",
      "--border": "rgba(255,255,255,0.06)",
      "--border-hover": "rgba(255,255,255,0.14)",
    },
  },
};

export function useTheme() {
  const [currentTheme, setCurrentTheme] = useState(() => {
    return localStorage.getItem("netflix-theme") || "netflix";
  });
  const [showThemePicker, setShowThemePicker] = useState(false);

  const applyTheme = useCallback((themeKey) => {
    const theme = THEMES[themeKey];
    if (!theme) return;
    const root = document.documentElement;
    Object.entries(theme.vars).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });
    localStorage.setItem("netflix-theme", themeKey);
    setCurrentTheme(themeKey);
  }, []);

  useEffect(() => {
    applyTheme(currentTheme);
  }, []);

  const themeList = Object.entries(THEMES).map(([key, val]) => ({
    key,
    ...val,
    isActive: key === currentTheme,
  }));

  return {
    currentTheme,
    showThemePicker, setShowThemePicker,
    themeList,
    applyTheme,
  };
}

export { THEMES };
