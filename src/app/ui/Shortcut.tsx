// src/app/ui/Shortcut.tsx
"use client";
import { useEffect } from "react";

export default function Shortcut() {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key.toLowerCase() === "n") {
        window.location.href = "/appointments";
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
  return null;
}
