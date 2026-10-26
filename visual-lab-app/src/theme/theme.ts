import { useEffect, useState } from "react";

export type LabTheme = "light" | "dark";

const STORAGE_KEY = "spring-lite-lab-theme";

function readStoredTheme(): LabTheme {
  try {
    return window.localStorage.getItem(STORAGE_KEY) === "dark" ? "dark" : "light";
  } catch {
    return "light";
  }
}

/** Keeps the lab theme on the root element and remembers the viewer's choice in this browser. */
export function useLabTheme() {
  const [theme, setTheme] = useState<LabTheme>(readStoredTheme);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try {
      window.localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      // Storage can be unavailable (private mode); the theme still applies for this visit.
    }
  }, [theme]);

  return {
    theme,
    toggleTheme: () => setTheme((current) => (current === "dark" ? "light" : "dark"))
  };
}
