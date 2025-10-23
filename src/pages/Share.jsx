import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../services/api.js";
import PayDialog from "../components/PayDialog.jsx";

export default function Share() {
  const { id } = useParams(); // CV id
  const [cv, setCv] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [payOpen, setPayOpen] = useState(false);
  const [shareLink, setShareLink] = useState("");

  const loadCv = async () => {
    try {
      const { data } = await api.get(`/api/v1/cvs/${id}`);
      setCv(data);
      if (data.shareUrl) setShareLink(data.shareUrl);
    } catch (e) {
      setError("Failed to load CV");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCv();
  }, [id]);

  const handlePaymentSuccess = async () => {
    // re-fetch to get share URL added by webhook
    await new Promise((r) => setTimeout(r, 1500)); // wait briefly for webhook to process
    await loadCv();
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="alert alert-danger">{error}</div>;
  if (!cv) return null;

  return (
    <div className="container py-4">
      <div className="card shadow-sm p-4">
        <h4 className="fw-bold mb-2">Share CV</h4>
        <div className="mb-1">
          <strong>CV:</strong> {cv.profile?.name || "Untitled"}
        </div>
        <p className="text-muted">
          Pay once to create a public share link that you can send to anyone.
          The link can render as a web page or a PDF.
        </p>

        {shareLink ? (
          <div className="alert alert-success">
            ✅ Share link ready:{" "}
            <a href={shareLink} target="_blank" rel="noreferrer">
              {shareLink}
            </a>
          </div>
        ) : (
          <button
            className="btn btn-primary"
            onClick={() => setPayOpen(true)}
          >
            Pay & Generate Share Link
          </button>
        )}
      </div>

  <PayDialog
  open={payOpen}
  cvId={id}
  action="share"
  onClose={() => setPayOpen(false)}
  onSuccess={async (payload) => {
    if (payload?.shareUrl) setShareLink(payload.shareUrl);
    else {
      const { data } = await api.get(`/api/v1/cvs/${id}`);
      setShareLink(data.shareUrl || '');
    }
  }}
/>


    </div>
  );
}
