import React, { useState } from "react";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import api from "../services/api.js";
import { useAuth } from "../context/AuthContext.jsx";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PK);

function Inner({ open, cvId, action = "download", onClose, onSuccess }) {
  const stripe = useStripe();
  const elements = useElements();
  const { user } = useAuth();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Billing details — required for Indian export compliance
  const [billing, setBilling] = useState({
    name: user?.username || "",
    email: user?.email || "",
    line1: "",
    city: "",
    state: "",
    postal_code: "",
    country: "IN",
  });

  if (!open) return null; // unmount when closed (prevents duplicate CardElements)

  const pay = async () => {
    setLoading(true);
    setError("");
    try {
      // 1) Create PaymentIntent (send description + billing to backend)
      const intentRes = await api.post("/api/v1/payments/intent", {
        cvId,
        action,
        description: `CV ${action} for "${cvId}"`,
        billing: {
          name: billing.name,
          email: billing.email || undefined,
          address: {
            line1: billing.line1,
            city: billing.city,
            state: billing.state,
            postal_code: billing.postal_code,
            country: billing.country,
          },
        },
      });
      const { clientSecret, paymentId } = intentRes.data || {};
      if (!clientSecret) throw new Error("Missing clientSecret from server");

      // 2) Confirm card payment with billing details
      const card = elements.getElement(CardElement);
      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card,
          billing_details: {
            name: billing.name,
            email: billing.email || undefined,
            address: {
              line1: billing.line1,
              city: billing.city,
              state: billing.state,
              postal_code: billing.postal_code,
              country: billing.country,
            },
          },
        },
      });

      if (result.error) {
        setError(result.error.message || "Payment failed");
        return;
      }

      if (result.paymentIntent?.status === "succeeded") {
        // 3) Verify & sync in DB (guarantees status = 'succeeded' even if webhook is slow/off)
        if (paymentId) {
          try {
            await api.post("/api/v1/payments/verify", { paymentId });
          } catch (_) {
            // non-fatal; PDF/share may still work if webhook already updated
          }
        }

        let payload;

        if (action === "share") {
          // Create/read share link idempotently
          try {
            // tiny delay to let webhook settle in test mode (optional)
            await new Promise((r) => setTimeout(r, 800));
            const resp = await api.post("/api/v1/shares", { cvId });
            payload = { shareUrl: resp.data?.shareUrl || "" };
          } catch (e) {
            // If Payment not marked yet (402), try fetching CV directly (webhook path)
            if (e?.response?.status === 402) {
              const cv = await api.get(`/api/v1/cvs/${cvId}`).then((r) => r.data);
              payload = { shareUrl: cv?.shareUrl || "" };
            } else {
              throw e;
            }
          }
        }

        // 4) Notify parent (Dashboard will download; Share page will show link)
        onSuccess?.(payload);
        onClose();
      }
    } catch (e) {
      setError(e?.response?.data?.message || e.message || "Payment error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="modal fade show"
      style={{ display: "block", background: "rgba(0,0,0,.4)" }}
      onClick={onClose}
    >
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Complete Payment</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>

          <div className="modal-body">
            {/* Billing details */}
            <div className="row g-2 mb-3">
              <div className="col-12">
                <input
                  className="form-control"
                  placeholder="Full Name"
                  value={billing.name}
                  onChange={(e) => setBilling({ ...billing, name: e.target.value })}
                />
              </div>
              <div className="col-12">
                <input
                  className="form-control"
                  placeholder="Email (for receipt)"
                  value={billing.email}
                  onChange={(e) => setBilling({ ...billing, email: e.target.value })}
                />
              </div>
              <div className="col-12">
                <input
                  className="form-control"
                  placeholder="Address Line 1"
                  value={billing.line1}
                  onChange={(e) => setBilling({ ...billing, line1: e.target.value })}
                />
              </div>
              <div className="col-md-5">
                <input
                  className="form-control"
                  placeholder="City"
                  value={billing.city}
                  onChange={(e) => setBilling({ ...billing, city: e.target.value })}
                />
              </div>
              <div className="col-md-4">
                <input
                  className="form-control"
                  placeholder="State"
                  value={billing.state}
                  onChange={(e) => setBilling({ ...billing, state: e.target.value })}
                />
              </div>
              <div className="col-md-3">
                <input
                  className="form-control"
                  placeholder="PIN / ZIP"
                  value={billing.postal_code}
                  onChange={(e) => setBilling({ ...billing, postal_code: e.target.value })}
                />
              </div>
              <div className="col-md-5">
                <select
                  className="form-select"
                  value={billing.country}
                  onChange={(e) => setBilling({ ...billing, country: e.target.value })}
                >
                  <option value="IN">India</option>
                  <option value="US">United States</option>
                  <option value="GB">United Kingdom</option>
                  <option value="CA">Canada</option>
                  <option value="AU">Australia</option>
                </select>
              </div>
            </div>

            {/* Stripe card input */}
            <div className="mb-2">
              <CardElement options={{ hidePostalCode: true }} />
            </div>
            {error && <div className="text-danger small">{error}</div>}
          </div>

          <div className="modal-footer">
            <button className="btn btn-outline-secondary" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button className="btn btn-primary" onClick={pay} disabled={!stripe || loading}>
              {loading ? "Processing…" : "Pay"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PayDialog(props) {
  return (
    <Elements stripe={stripePromise}>
      <Inner {...props} />
    </Elements>
  );
}
