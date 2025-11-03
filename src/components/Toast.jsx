// src/components/Toast.jsx
import React, { useEffect, useState } from "react";

const TYPE_STYLES = {
  success: "text-bg-success",
  error: "text-bg-danger",
  warning: "text-bg-warning",
  info: "text-bg-primary",
};

const TYPE_ICONS = {
  success: "bi-check-circle",
  error: "bi-exclamation-circle",
  warning: "bi-exclamation-triangle",
  info: "bi-info-circle",
};

/**
 * Shows a Bootstrap toast notification
 * @param {Object} props Component props
 * @param {string} props.message Toast message text
 * @param {"success"|"error"|"warning"|"info"} [props.type="info"] Toast type (affects color and icon)
 * @param {number} [props.duration=3500] Auto-hide duration in ms (set to 0 to disable auto-hide)
 * @param {() => void} [props.onClose] Optional callback when toast is closed
 */
export default function Toast({ message, type = "info", duration = 3500, onClose }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (message) {
      setVisible(true);
      const t = setTimeout(() => {
        setVisible(false);
        onClose?.();
      }, duration);
      return () => clearTimeout(t);
    }
  }, [message, duration, onClose]);

  if (!message) return null;

  const handleClose = () => {
    setVisible(false);
    onClose?.();
  };

  return (
    <div className="position-fixed bottom-0 end-0 p-3" style={{ zIndex: 1080 }}>
      <div
        className={`toast align-items-center border-0 ${TYPE_STYLES[type]} ${visible ? "show" : "hide"}`}
        role="status"
        aria-live="polite"
      >
        <div className="d-flex">
          <div className="toast-body">
            <i className={`bi ${TYPE_ICONS[type]} me-2`}></i>
            {message}
          </div>
          <button 
            type="button" 
            className="btn-close btn-close-white me-2 m-auto" 
            onClick={handleClose}
            aria-label="Close"
          />
        </div>
      </div>
    </div>
  );
}