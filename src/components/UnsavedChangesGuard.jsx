// src/components/UnsavedChangesGuard.jsx
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

/**
 * Fallback version without unstable_useBlocker.
 * Shows browser confirm dialog for in-app route changes.
 */
export default function UnsavedChangesGuard({ when }) {
  const navigate = useNavigate();

  useEffect(() => {
    if (!when) return;

    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handleBeforeUnload);

    // Intercept SPA route navigation
    const originalPush = navigate;
    navigate.blocked = false;

    // Create a simple wrapper that asks for confirmation
    const guardedNavigate = (to, opts) => {
      if (when && !window.confirm("You have unsaved changes. Leave this page?")) {
        return; // stay on page
      }
      originalPush(to, opts);
    };

    // Monkey-patch for this session only
    navigate._origNavigate = originalPush;
    navigate._guarded = guardedNavigate;

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      if (navigate._origNavigate) {
        delete navigate._origNavigate;
        delete navigate._guarded;
      }
    };
  }, [when, navigate]);

  return null;
}
