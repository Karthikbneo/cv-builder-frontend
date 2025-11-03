// src/hooks/useBeforeUnload.js
import { useEffect } from "react";

export default function useBeforeUnload(when) {
  useEffect(() => {
    if (!when) return;
    const handler = (e) => {
      e.preventDefault();
      // Chrome requires returnValue to be set
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [when]);
}
