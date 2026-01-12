import { useEffect } from "react";

export function useThemePreference() {
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("theme-light");
    root.classList.add("dark");
  }, []);
}
