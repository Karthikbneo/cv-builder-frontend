// src/pages/Editor.jsx
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import api from "../services/api.js";
import CVForm from "../components/CVForm.jsx";
import CVPreview from "../components/CVPreview.jsx";

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

  const [cv, setCv] = useState(emptyCV);
  const [saving, setSaving] = useState(false);
  const [loadedId, setLoadedId] = useState(null);
  const [error, setError] = useState("");
  const isEdit = Boolean(id);

  useEffect(() => {
    (async () => {
      if (!id) return;
      try {
        const { data } = await api.get(`/api/v1/cvs/${id}`);
        // ensure theme exists
        setCv({
          ...emptyCV,
          ...data,
          theme: { ...emptyCV.theme, ...(data.theme || {}) },
        });
        setLoadedId(data._id);
      } catch (e) {
        setError("Failed to load CV. Please try again.");
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const save = async () => {
    setSaving(true);
    setError("");
    try {
      if (isEdit) {
        const { data } = await api.put(`/api/v1/cvs/${id}`, cv);
        setCv(data);
      } else {
        const { data } = await api.post(`/api/v1/cvs`, cv);
        setCv(data);
        setLoadedId(data._id);
        nav(`/editor/${data._id}`, { replace: true });
      }
    } catch (e) {
      setError(e?.response?.data?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

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
        <div className="d-flex gap-2">
          <button className="btn btn-outline-secondary" onClick={() => nav("/dashboard")}>
            <i className="bi bi-arrow-left me-1" /> Back
          </button>
          <motion.button
            className="btn btn-primary"
            onClick={save}
            disabled={saving}
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
                Save
              </>
            )}
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

              {/* Template picker */}
              <div className="row g-2 align-items-end mb-3">
                <div className="col-md-6">
                  <label className="form-label small text-muted fw-semibold">
                    Layout / Template
                  </label>
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

                {/* Theme controls */}
                <div className="col-md-6">
                  <label className="form-label small text-muted fw-semibold">Font</label>
                  <select
                    className="form-select"
                    value={cv.theme?.font || "Inter"}
                    onChange={(e) => setTheme({ font: e.target.value })}
                  >
                    {FONT_OPTIONS.map((f) => (
                      <option key={f} value={f}>
                        {f}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-md-6">
                  <label className="form-label small text-muted fw-semibold">
                    Base Font Size
                  </label>
                  <select
                    className="form-select"
                    value={cv.theme?.size || "12px"}
                    onChange={(e) => setTheme({ size: e.target.value })}
                  >
                    {SIZE_OPTIONS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-md-3">
                  <label className="form-label small text-muted fw-semibold">
                    Primary Color
                  </label>
                  <input
                    type="color"
                    className="form-control form-control-color"
                    value={cv.theme?.colors?.primary || "#111827"}
                    onChange={(e) => setColor("primary", e.target.value)}
                    title="Choose primary color"
                  />
                </div>

                <div className="col-md-3">
                  <label className="form-label small text-muted fw-semibold">
                    Accent Color
                  </label>
                  <input
                    type="color"
                    className="form-control form-control-color"
                    value={cv.theme?.colors?.accent || "#2563eb"}
                    onChange={(e) => setColor("accent", e.target.value)}
                    title="Choose accent color"
                  />
                </div>
              </div>

              {/* Main form fields (Basic, Edu, Exp, Projects, Skills, Socials) */}
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

              {/* Bottom actions for mobile ergonomics */}
              <div className="d-flex justify-content-end gap-2 mt-3">
                <button className="btn btn-outline-secondary" onClick={() => nav("/dashboard")}>
                  Back
                </button>
                <button className="btn btn-primary" onClick={save} disabled={saving}>
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

              {/* Scaling container for a clean preview window */}
              <div
                className="border rounded bg-light-subtle p-2"
                style={{ height: "75vh", overflow: "auto" }}
              >
                {/* Pass theme/customizations down */}
                <CVPreview cv={cv} />
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
