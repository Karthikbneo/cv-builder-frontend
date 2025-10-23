// src/pages/Dashboard.jsx
import React, { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import api from "../services/api.js";
import PayDialog from "../components/PayDialog.jsx";

export default function Dashboard() {
  const [cvs, setCvs] = useState([]);
  const [cursor, setCursor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [moreLoading, setMoreLoading] = useState(false);
  const [error, setError] = useState("");

  // payment modal state
  const [payOpen, setPayOpen] = useState(false);
  const [payFor, setPayFor] = useState({ cvId: null, action: "download" });

  const cardVariants = {
    hidden: { opacity: 0, y: 16 },
    show: (i) => ({
      opacity: 1,
      y: 0,
      transition: { duration: 0.35, delay: 0.05 * i },
    }),
  };

  const load = async (nextCursor = null) => {
    (nextCursor ? setMoreLoading : setLoading)(true);
    setError("");
    try {
      const url = nextCursor
        ? `/api/v1/cvs?cursor=${encodeURIComponent(nextCursor)}&limit=6`
        : "/api/v1/cvs?limit=6";
      const { data } = await api.get(url);
      setCvs((prev) => (nextCursor ? [...prev, ...data.items] : data.items));
      setCursor(data.nextCursor);
    } catch (e) {
      setError("Failed to load CVs");
    } finally {
      (nextCursor ? setMoreLoading : setLoading)(false);
    }
  };

  useEffect(() => {
    load(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Safe download with auth + content-type guard
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

  const skeletons = useMemo(() => Array.from({ length: 6 }), []);

  return (
    <motion.div
      className="container py-3"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35 }}
    >
      {/* Header */}
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-3">
        <div>
          <h3 className="mb-0">Your CVs</h3>
          <div className="text-muted small">Create, edit, download and share your resumes</div>
        </div>
        <Link to="/editor" className="btn btn-primary">
          <i className="bi bi-plus-lg me-1" /> Create New
        </Link>
      </div>

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.div
            className="alert alert-danger d-flex align-items-center"
            role="alert"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
          >
            <i className="bi bi-exclamation-triangle me-2" />
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty state */}
      {!loading && cvs.length === 0 && (
        <motion.div
          className="text-center py-5 bg-light rounded-3 border"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="display-6 mb-2">No CVs yet</div>
          <p className="text-muted mb-3">
            Start by creating your first CV using our modern layouts.
          </p>
          <Link to="/layouts" className="btn btn-outline-primary">
            <i className="bi bi-layout-text-window me-1" /> Browse Layouts
          </Link>
        </motion.div>
      )}

      {/* Grid */}
      <div className="row g-3">
        {/* Loading skeletons */}
        {loading &&
          skeletons.map((_, i) => (
            <div className="col-md-6" key={`sk-${i}`}>
              <div className="card h-100 border-0 shadow-sm">
                <div className="card-body">
                  <div className="placeholder-glow">
                    <span className="placeholder col-6 placeholder-lg" />
                  </div>
                  <div className="placeholder-glow mt-2">
                    <span className="placeholder col-4" />
                  </div>
                  <div className="placeholder-glow mt-3">
                    <span className="placeholder col-3 me-2" />
                    <span className="placeholder col-2" />
                  </div>
                  <div className="placeholder-glow mt-3">
                    <span className="placeholder col-4 me-2" />
                    <span className="placeholder col-3" />
                  </div>
                </div>
              </div>
            </div>
          ))}

        {/* Real cards */}
        {!loading && (
          <AnimatePresence initial={false}>
            {cvs.map((cv, i) => (
              <motion.div
                className="col-md-6"
                key={cv._id}
                custom={i}
                initial="hidden"
                animate="show"
                exit={{ opacity: 0, y: 10 }}
                variants={cardVariants}
              >
                <div className="card h-100 border-0 shadow-sm card-hover">
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-start">
                      <div>
                        <h5 className="card-title mb-1">
                          {cv.profile?.name || "Untitled CV"}
                        </h5>
                        <div className="text-muted small">
                          Updated {new Date(cv.updatedAt).toLocaleString()}
                        </div>
                      </div>
                      <span className="badge bg-light text-dark border">
                        {cv.template?.toUpperCase?.() || "CLASSIC"}
                      </span>
                    </div>

                    {/* Quick meta */}
                    <div className="mt-2 text-muted small">
                      {cv.profile?.email && (
                        <>
                          <i className="bi bi-envelope me-1" />
                          {cv.profile.email}
                          <span className="mx-2">•</span>
                        </>
                      )}
                      {cv.profile?.city && (
                        <>
                          <i className="bi bi-geo-alt me-1" />
                          {cv.profile.city}
                        </>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="mt-3 d-flex flex-wrap gap-2">
                      <Link className="btn btn-sm btn-outline-secondary" to={`/editor/${cv._id}`}>
                        <i className="bi bi-pencil-square me-1" />
                        Edit
                      </Link>
                      <Link className="btn btn-sm btn-outline-info" to={`/share/${cv._id}`}>
                        <i className="bi bi-share me-1" />
                        Share
                      </Link>
                      <button
                        className="btn btn-sm btn-primary"
                        onClick={() => {
                          setPayFor({ cvId: cv._id, action: "download" });
                          setPayOpen(true);
                        }}
                      >
                        <i className="bi bi-cloud-arrow-down me-1" />
                        Pay & Download
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>

      {/* Load more */}
      <div className="text-center my-3">
        {cursor ? (
          <motion.button
            className="btn btn-outline-secondary"
            onClick={() => load(cursor)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={moreLoading}
          >
            {moreLoading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" />
                Loading…
              </>
            ) : (
              "Load More"
            )}
          </motion.button>
        ) : (
          !loading &&
          cvs.length > 0 && <span className="text-muted small">No more items</span>
        )}
      </div>

      {/* Payment modal (single instance for the page) */}
      <PayDialog
        open={payOpen}
        cvId={payFor.cvId}
        action="download"
        onClose={() => setPayOpen(false)}
        onSuccess={() => downloadPdf(payFor.cvId)}
      />
    </motion.div>
  );
}
