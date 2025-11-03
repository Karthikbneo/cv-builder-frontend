// src/components/SaveReminderToast.jsx
import React, { useEffect, useState } from "react";

/** Shows a Bootstrap toast when `show` is true */
export default function SaveReminderToast({ show }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (show) {
      setVisible(true);
      const t = setTimeout(() => setVisible(false), 3500);
      return () => clearTimeout(t);
    }
  }, [show]);

  return (
    <div className="position-fixed bottom-0 end-0 p-3" style={{ zIndex: 1080 }}>
      <div
        className={`toast align-items-center text-bg-warning border-0 ${visible ? "show" : "hide"}`}
        role="status"
        aria-live="polite"
      >
        <div className="d-flex">
          <div className="toast-body">
            <i className="bi bi-exclamation-triangle me-2"></i>
            You have unsaved changes. Don’t forget to click <b>Save</b>.
          </div>
          <button type="button" className="btn-close btn-close-white me-2 m-auto" onClick={() => setVisible(false)} />
        </div>
      </div>
    </div>
  );
}
