import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../services/api.js";
import CVPreview from "../components/CVPreview.jsx";

export default function PublicView() {
  const { id } = useParams();
  const [cv, setCv] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true); setError("");
      try {
        const { data } = await api.get(`/api/v1/public/cv/${id}`);
        setCv(data);
      } catch (e) {
        setError(e?.response?.data?.message || "Shared CV not found");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const openPdf = () => {
    window.open(`${import.meta.env.VITE_API_BASE}/api/v1/public/cv/${id}/pdf`, "_blank");
  };

  return (
    <div className="container py-3">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4 className="mb-0">Public CV</h4>
        <div className="d-flex gap-2">
          <button className="btn btn-outline-secondary" onClick={() => window.history.back()}>
            <i className="bi bi-arrow-left me-1" /> Back
          </button>
          <button className="btn btn-primary" onClick={openPdf}>
            <i className="bi bi-file-earmark-pdf me-1" /> Open as PDF
          </button>
        </div>
      </div>

      {loading && <div className="text-muted">Loading…</div>}
      {error && <div className="alert alert-danger">{error}</div>}

      {cv && (
        <div className="card shadow-sm">
          <div className="card-body">
            <div className="border rounded bg-light-subtle p-2" style={{ minHeight: 400 }}>
              <CVPreview cv={cv} /> {/* uses cv.template + cv.theme */}
            </div>
          </div>
        </div>
      )}

      <div className="text-center text-muted small mt-3">
        Shared via CV Builder
      </div>
    </div>
  );
}
