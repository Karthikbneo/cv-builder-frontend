// src/pages/Editor.jsx
import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import api from "../services/api.js";
import CVForm from "../components/CVForm.jsx";
import CVPreview from "../components/CVPreview.jsx";
import SaveReminderToast from "../components/SaveReminderToast.jsx";
import Toast from "../components/Toast.jsx";
import useBeforeUnload from "../hooks/useBeforeUnload.js";
import PayDialog from "../components/PayDialog.jsx";

const emptyCV = {
  template: "classic",
  profile: {},
  education: [],
  experience: [],
  projects: [],
  skills: [],
  socials: [],
  theme: {
    font: "Inter",
    size: "12px",
    colors: { primary: "#111827", accent: "#2563eb" },
  },
};

const FONT_OPTIONS = ["Inter", "Roboto", "Georgia", "Times New Roman", "Arial", "System UI"];
const SIZE_OPTIONS = ["11px", "12px", "13px", "14px", "15px", "16px"];

export default function Editor() {
  const { id } = useParams();
  const nav = useNavigate();

  // State
  const [cv, setCv] = useState(emptyCV);
  const [loadedId, setLoadedId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(!!id);
  const [error, setError] = useState("");
  const [toast, setToast] = useState({ message: "", type: "info" });

  const isEdit = Boolean(id);

  // Dirty tracking baseline (stringify is simple & reliable here)
  const lastSavedRef = useRef(JSON.stringify(emptyCV));
  const dirty = useMemo(() => JSON.stringify(cv) !== lastSavedRef.current, [cv]);

  // Warn on tab close/refresh
  useBeforeUnload(dirty);

  // Payments
  const [payOpenDownload, setPayOpenDownload] = useState(false);
  const [payOpenShare, setPayOpenShare] = useState(false);

  // -------- Load CV on mount (edit mode) ----------
  useEffect(() => {
    let abort = false;
    (async () => {
      if (!id) return;
      setLoading(true);
      setError("");
      try {
        const { data } = await api.get(`/api/v1/cvs/${id}`);
        if (abort) return;
        const merged = {
          ...emptyCV,
          ...data,
          theme: { ...emptyCV.theme, ...(data.theme || {}) },
        };
        setCv(merged);
        setLoadedId(data._id);
        lastSavedRef.current = JSON.stringify(merged);
      } catch (e) {
        if (abort) return;
        const code = e?.response?.status;
        if (code === 401) return nav("/login", { replace: true });
        if (code === 404) return nav("/dashboard", { replace: true });
        setError("Failed to load CV. Please try again.");
      } finally {
        if (!abort) setLoading(false);
      }
    })();
    return () => { abort = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // -------- Save handlers ----------
  // deep-clean helper: removes empty strings, empty arrays, and empty objects
  const cleanValue = (val) => {
    if (val === null || val === undefined) return undefined;
    if (typeof val === "string") {
      const t = val.trim();
      return t === "" ? undefined : t;
    }
    if (Array.isArray(val)) {
      const out = val
        .map((v) => cleanValue(v))
        .filter((v) => {
          // drop undefined/null
          if (v === undefined || v === null) return false;
          // drop empty objects
          if (typeof v === "object" && !Array.isArray(v) && Object.keys(v).length === 0) return false;
          // drop empty arrays
          if (Array.isArray(v) && v.length === 0) return false;
          return true;
        });
      return out.length === 0 ? undefined : out;
    }
    if (typeof val === "object") {
      const next = {};
      Object.entries(val).forEach(([k, v]) => {
          let cv = cleanValue(v);
          // special-case: skills array should drop items without a non-empty name
          if (k === "skills" && Array.isArray(cv)) {
            cv = cv.filter((s) => (s?.name || "").toString().trim() !== "");
            if (cv.length === 0) cv = undefined;
          }
          if (cv !== undefined) next[k] = cv;
      });
      return Object.keys(next).length === 0 ? undefined : next;
    }
    // numbers, booleans, etc - keep as-is
    return val;
  };
  const saveInternal = useCallback(async () => {
    setSaving(true);
    setError("");
    try {
      // clean the CV before sending to the server to avoid persisting empty fields
      const cleaned = cleanValue(cv) || {};
      if (isEdit) {
        const { data } = await api.put(`/api/v1/cvs/${id}`, cleaned);
        setCv(data);
        setLoadedId(data._id);
        lastSavedRef.current = JSON.stringify(data);
        setToast({ message: "CV saved successfully!", type: "success" });
        return data;
      } else {
        const { data } = await api.post(`/api/v1/cvs`, cleaned);
        setCv(data);
        setLoadedId(data._id);
        lastSavedRef.current = JSON.stringify(data);
        nav(`/editor/${data._id}`, { replace: true });
        setToast({ message: "CV created successfully!", type: "success" });
        return data;
      }
    } catch (e) {
      const msg = e?.response?.data?.message || "Failed to save CV";
      setError(msg);
      setToast({ message: msg, type: "error" });
      throw e;
    } finally {
      setSaving(false);
    }
  }, [cv, id, isEdit, nav]);

  const save = async () => {
    if (!dirty) return;
    await saveInternal();
  };

  // Ensure latest save before continuing (e.g., payment)
  const ensureSavedThen = async (continuation) => {
    try {
      let doc = null;
      if (!loadedId || dirty) doc = await saveInternal();
      const idToUse = doc?._id || loadedId;
      if (!idToUse) return;
      continuation?.(idToUse);
    } catch {
      // Error already surfaced
    }
  };

  // -------- Theming helpers ----------
  const setTheme = (patch) =>
    setCv((prev) => ({ ...prev, theme: { ...prev.theme, ...patch } }));

  const setColor = (key, value) =>
    setCv((prev) => ({
      ...prev,
      theme: {
        ...prev.theme,
        colors: { ...prev.theme?.colors, [key]: value },
      },
    }));

  // -------- Download & Share helpers ----------
  const downloadPdf = async (cvId) => {
    try {
      const res = await api.get(`/api/v1/cvs/${cvId}/pdf`, { responseType: "blob" });
      const ct = (res.headers["content-type"] || "").toLowerCase();
      if (!ct.includes("application/pdf")) {
        const text = await new Response(res.data).text();
        throw new Error(text || "Server did not return a PDF");
      }
      const blob = new Blob([res.data], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `cv-${cvId}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      alert(e?.message || "Could not download PDF");
    }
  };

  const handleShareSuccess = async (payload) => {
    let url = payload?.shareUrl || "";
    try {
      if (!url && loadedId) {
        const { data } = await api.post("/api/v1/shares", { cvId: loadedId });
        url = data?.shareUrl || "";
      }
    } catch {
      try {
        const { data } = await api.get(`/api/v1/cvs/${loadedId}`);
        url = data?.shareUrl || "";
      } catch {
        /* ignore */
      }
    }
    if (url) {
      try { await navigator.clipboard.writeText(url); } catch {}
      alert(`Share link ready:\n${url}\n\n(The link is copied to your clipboard)`);
    } else {
      alert("Payment succeeded, but the share link isn't ready yet. Please try again in a moment.");
    }
  };

  // Confirm on Back if dirty
  const goBack = () => {
    if (dirty && !window.confirm("You have unsaved changes. Leave without saving?")) return;
    nav("/dashboard");
  };

  // -------- UI ----------
  return (
    <motion.div
      className="container py-3"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h3 className="fw-bold mb-1">{isEdit ? "Edit CV" : "Create New CV"}</h3>
          <div className="text-muted small">
            Fill your details on the left, preview updates on the right.
          </div>
        </div>

        <div className="d-flex flex-wrap gap-2">
          <motion.button
            className="btn btn-outline-secondary"
            onClick={goBack}
            title="Back to dashboard"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <i className="bi bi-arrow-left me-1" /> Back
          </motion.button>

          <motion.button
            className="btn btn-primary"
            onClick={save}
            disabled={saving || !dirty}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
          >
            {saving ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" /> Saving…
              </>
            ) : (
              <>
                <i className="bi bi-save me-1" />
                {dirty ? "Save" : "Saved"}
              </>
            )}
          </motion.button>

          <motion.button
            className="btn btn-success"
            disabled={loading}
            onClick={() => ensureSavedThen(() => setPayOpenDownload(true))}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            title="Pay & download as PDF"
          >
            <i className="bi bi-credit-card me-1" />
            Pay & Download
          </motion.button>

          <motion.button
            className="btn btn-outline-info"
            disabled={loading}
            onClick={() => ensureSavedThen(() => setPayOpenShare(true))}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            title="Pay & get a public share link"
          >
            <i className="bi bi-link-45deg me-1" />
            Pay & Share
          </motion.button>
        </div>
      </div>

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.div
            className="alert alert-danger"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
          >
            <i className="bi bi-exclamation-triangle me-2" />
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading skeleton */}
      {loading ? (
        <div className="row g-3">
          <div className="col-lg-6">
            <div className="card border-0 shadow-sm">
              <div className="card-body">
                <div className="placeholder-glow">
                  <span className="placeholder col-6 placeholder-lg" />
                </div>
                <div className="mt-3 placeholder-glow">
                  <span className="placeholder col-12" />
                  <span className="placeholder col-10" />
                  <span className="placeholder col-8" />
                </div>
              </div>
            </div>
          </div>
          <div className="col-lg-6">
            <div className="card border-0 shadow-sm">
              <div className="card-body">
                <div className="ratio ratio-4x3 bg-light rounded" />
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="row g-3 align-items-stretch">
          {/* LEFT: Form + Theme */}
          <motion.div
            className="col-lg-6"
            initial={{ x: -24, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.35 }}
          >
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body">
                <h5 className="card-title d-flex align-items-center mb-3">
                  <i className="bi bi-pencil-square me-2 text-primary" />
                  Editor
                </h5>

                <div className="row g-2 align-items-end mb-3">
                  <div className="col-md-6">
                    <label className="form-label small text-muted fw-semibold">Layout / Template</label>
                    <select
                      className="form-select"
                      value={cv.template || "classic"}
                      onChange={(e) => setCv((p) => ({ ...p, template: e.target.value }))}
                    >
                      <option value="classic">Classic</option>
                      <option value="modern">Modern</option>
                      <option value="elegant">Elegant</option>
                    </select>
                  </div>

                  <div className="col-md-6">
                    <label className="form-label small text-muted fw-semibold">Font</label>
                    <select
                      className="form-select"
                      value={cv.theme?.font || "Inter"}
                      onChange={(e) => setTheme({ font: e.target.value })}
                    >
                      {FONT_OPTIONS.map((f) => (
                        <option key={f} value={f}>{f}</option>
                      ))}
                    </select>
                  </div>

                  <div className="col-md-6">
                    <label className="form-label small text-muted fw-semibold">Base Font Size</label>
                    <select
                      className="form-select"
                      value={cv.theme?.size || "12px"}
                      onChange={(e) => setTheme({ size: e.target.value })}
                    >
                      {SIZE_OPTIONS.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>

                  <div className="col-md-3">
                    <label className="form-label small text-muted fw-semibold">Primary Color</label>
                    <input
                      type="color"
                      className="form-control form-control-color"
                      value={cv.theme?.colors?.primary || "#111827"}
                      onChange={(e) => setColor("primary", e.target.value)}
                      title="Choose primary color"
                    />
                  </div>

                  <div className="col-md-3">
                    <label className="form-label small text-muted fw-semibold">Accent Color</label>
                    <input
                      type="color"
                      className="form-control form-control-color"
                      value={cv.theme?.colors?.accent || "#2563eb"}
                      onChange={(e) => setColor("accent", e.target.value)}
                      title="Choose accent color"
                    />
                  </div>
                </div>

                <CVForm
                  value={cv}
                  onChange={setCv}
                  onUpload={(url) =>
                    setCv((prev) => ({
                      ...prev,
                      profile: { ...(prev.profile || {}), imageUrl: url },
                    }))
                  }
                />

                <div className="d-flex justify-content-end gap-2 mt-3">
                  <button className="btn btn-outline-secondary" onClick={goBack}>
                    Back
                  </button>
                  <button className="btn btn-primary" onClick={save} disabled={saving || !dirty}>
                    {saving ? "Saving…" : "Save"}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>

          {/* RIGHT: Live Preview */}
          <motion.div
            className="col-lg-6"
            initial={{ x: 24, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.35 }}
          >
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <h5 className="card-title mb-0">
                    <i className="bi bi-eye-fill me-2 text-success" />
                    Live Preview
                  </h5>
                  <span className="badge bg-light text-dark border">
                    {cv.template?.toUpperCase?.() || "CLASSIC"}
                  </span>
                </div>

                <div className="border rounded bg-light-subtle p-2" style={{ height: "75vh", overflow: "auto" }}>
                  <CVPreview cv={cv} />
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Gentle reminder (toast) */}
      <SaveReminderToast show={dirty} />

      {/* Save success/error toast */}
      <Toast 
        message={toast.message} 
        type={toast.type} 
        onClose={() => setToast({ message: "", type: "info" })}
      />

      {/* Payment Modals */}
      <PayDialog
        open={payOpenDownload}
        cvId={loadedId}
        action="download"
        onClose={() => setPayOpenDownload(false)}
        onSuccess={() => downloadPdf(loadedId)}
      />
      <PayDialog
        open={payOpenShare}
        cvId={loadedId}
        action="share"
        onClose={() => setPayOpenShare(false)}
        onSuccess={handleShareSuccess}
      />
    </motion.div>
  );
}
