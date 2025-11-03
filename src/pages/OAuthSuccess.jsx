import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../services/api.js";
import { useAuth } from "../context/AuthContext.jsx";

export default function OAuthSuccess() {
  const [sp] = useSearchParams();
  const { login } = useAuth();
  const nav = useNavigate();
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const access = sp.get("access");
        const refresh = sp.get("refresh");
        if (!access) throw new Error("Missing OAuth tokens");

        // set token temporarily so we can call /me
        api.setToken(access);

        // fetch user profile
        const { data } = await api.get("/api/v1/auth/me");

        // normalize payload for your AuthContext (supports both shapes)
        await login({
          user: data.user,
          access,
          refresh: refresh || "",
          tokens: { access, refresh: refresh || "" }, // in case your login expects tokens field
        });

        nav("/dashboard", { replace: true });
      } catch (e) {
        setError(e?.response?.data?.message || e.message || "OAuth failed");
      }
    })();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center">
      <div className="text-center">
        {!error ? (
          <>
            <div className="spinner-border" role="status" />
            <div className="mt-2 text-muted">Signing you in…</div>
          </>
        ) : (
          <>
            <div className="text-danger fw-semibold mb-2">OAuth Error</div>
            <div className="text-muted">{error}</div>
          </>
        )}
      </div>
    </div>
  );
}