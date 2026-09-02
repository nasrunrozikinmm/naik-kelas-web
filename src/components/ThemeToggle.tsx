"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

import LightModeIcon from "@mui/icons-material/LightMode";
import DarkModeIcon from "@mui/icons-material/DarkMode";

export function ThemeToggle({ className = "" }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <button 
        type="button"
        className={`flex items-center justify-center p-2 h-10 w-10 text-on-surface-variant hover:bg-surface-variant rounded-full transition-all ${className}`}
        aria-label="Toggle Theme"
      >
        <LightModeIcon sx={{ fontSize: 20 }} />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      className={`flex items-center justify-center p-2 h-10 w-10 text-on-surface-variant hover:bg-surface-variant rounded-full transition-all ${className}`}
      aria-label="Toggle Theme"
    >
      {resolvedTheme === "dark" ? (
        <LightModeIcon sx={{ fontSize: 20, color: "#fbbf24" }} />
      ) : (
        <DarkModeIcon sx={{ fontSize: 20, color: "inherit" }} />
      )}
    </button>
  );
}
