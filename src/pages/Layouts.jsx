// src/pages/Layouts.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import api from "../services/api.js";
import { useAuth } from "../context/AuthContext.jsx";
import CVPreview from "../components/CVPreview.jsx";

function PreviewModal({ open, onClose, template, data }) {
  if (!open) return null;
  const demoCv = {
    template: template,
    theme: {
      font: "Inter",
      size: "12px",
      colors: { primary: "#111827", accent: "#2563eb" },
    },
    profile: {},
    education: [],
    experience: [],
    projects: [],
    skills: [],
    socials: [],
    ...(data || {}),
  };

  return (
    <div className="modal fade show" style={{ display: "block", background: "rgba(0,0,0,.5)" }} onClick={onClose}>
      <div className="modal-dialog modal-lg" onClick={(e) => e.stopPropagation()}>
        <div className="modal-content">
          <div className="modal-header">
            <h6 className="modal-title">Preview — {String(template).toUpperCase()}</h6>
            <button type="button" className="btn-close" onClick={onClose} />
          </div>
          <div className="modal-body" style={{ maxHeight: "75vh", overflow: "auto" }}>
            <div className="border rounded p-2 bg-light-subtle">
              <CVPreview cv={demoCv} />
            </div>
          </div>
          <div className="modal-footer">
            <button className="btn btn-outline-secondary" onClick={onClose}>Close</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Layouts() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [preview, setPreview] = useState({ open: false, tpl: null });

  const nav = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError("");
      try {
        const { data } = await api.get("/api/v1/templates");
        setItems(data.items || []);
      } catch (e) {
        setError("Failed to load layouts");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const startWith = async (tpl) => {
    if (!user) return nav("/login");
    try {
      const payload = tpl.demo || { template: tpl.key, profile: {} };
      const { data } = await api.post("/api/v1/cvs", payload);
      nav(`/editor/${data._id}`);
    } catch (e) {
      setError(e?.response?.data?.message || "Could not create CV from template");
    }
  };

  const skeletons = useMemo(() => Array.from({ length: 6 }), []);
  const cardVariants = {
    hidden: { opacity: 0, y: 16 },
    show: (i) => ({ opacity: 1, y: 0, transition: { duration: 0.35, delay: 0.06 * i } }),
  };

  return (
    <motion.div className="container py-3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-3">
        <div>
          <h3 className="mb-0">Choose a Layout</h3>
          <div className="text-muted small">Pick a template; you can customize fonts, sizes, and colors in the editor.</div>
        </div>
        <button className="btn btn-outline-secondary" onClick={() => nav(-1)}>
          <i className="bi bi-arrow-left me-1" /> Back
        </button>
      </div>

      <AnimatePresence>
        {error && (
          <motion.div className="alert alert-danger" initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}>
            <i className="bi bi-exclamation-triangle me-2" /> {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty */}
      {!loading && items.length === 0 && !error && (
        <motion.div className="text-center py-5 bg-light rounded-3 border" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <div className="display-6 mb-2">No layouts available</div>
          <p className="text-muted mb-0">New templates coming soon.</p>
        </motion.div>
      )}

      {/* Grid */}
      <div className="row g-3">
        {loading &&
          skeletons.map((_, i) => (
            <div className="col-md-4" key={`sk-${i}`}>
              <div className="card h-100 border-0 shadow-sm">
                <div className="card-body">
                  <div className="ratio ratio-4x3 bg-light rounded mb-3" />
                  <div className="placeholder-glow">
                    <span className="placeholder col-7 placeholder-lg" />
                  </div>
                  <div className="placeholder-glow mt-2">
                    <span className="placeholder col-5" />
                  </div>
                </div>
              </div>
            </div>
          ))}

        {!loading && (
          <AnimatePresence initial={false}>
            {items.map((tpl, i) => (
              <motion.div className="col-md-4" key={tpl.key} custom={i} initial="hidden" animate="show" exit={{ opacity: 0, y: 10 }} variants={cardVariants}>
                <motion.div
                  className="card h-100 border-0 shadow-sm"
                  whileHover={{ y: -4, boxShadow: "0 .5rem 1rem rgba(0,0,0,.15)" }}
                  transition={{ type: "spring", stiffness: 250, damping: 20 }}
                >
                  {/* Preview */}
                  <div className="ratio ratio-4x3 bg-light rounded-top">
                    {tpl.previewUrl ? (
                      <img src={tpl.previewUrl} alt={`${tpl.name} preview`} className="w-100 h-100 object-fit-cover rounded-top" />
                    ) : (
                      <div className="d-flex align-items-center justify-content-center text-muted">
                        <i className="bi bi-layout-text-window fs-2" />
                      </div>
                    )}
                  </div>

                  <div className="card-body d-flex flex-column">
                    <div className="d-flex justify-content-between align-items-start">
                      <h5 className="card-title mb-1">{tpl.name}</h5>
                      <span className="badge bg-light text-dark border">{tpl.key?.toUpperCase?.()}</span>
                    </div>
                    {tpl.description && <p className="text-muted small flex-grow-1 mt-1 mb-2">{tpl.description}</p>}

                    <div className="d-flex gap-2 mt-auto">
                      <motion.button
                        className="btn btn-outline-secondary w-50"
                        onClick={() => setPreview({ open: true, tpl })}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <i className="bi bi-eye me-1" />
                        Quick Preview
                      </motion.button>
                      <motion.button
                        className="btn btn-primary w-50"
                        onClick={() => startWith(tpl)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <i className="bi bi-magic me-1" />
                        Use this
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>

      {/* Live Preview Modal using CVPreview + tpl.demo */}
      <PreviewModal
        open={preview.open}
        onClose={() => setPreview({ open: false, tpl: null })}
        template={preview.tpl?.key}
        data={preview.tpl?.demo}
      />
    </motion.div>
  );
}
