import React, { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../services/api.js";
import { useAuth } from "../context/AuthContext.jsx";

export default function Register() {
  const nav = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirm: "",
    agree: false,
  });
  const [showPw, setShowPw] = useState(false);
  const [showPw2, setShowPw2] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }));
  };

  // Simple strength scoring
  const pwScore = useMemo(() => {
    const p = form.password || "";
    let score = 0;
    if (p.length >= 8) score++;
    if (/[A-Z]/.test(p)) score++;
    if (/[a-z]/.test(p)) score++;
    if (/\d/.test(p)) score++;
    if (/[^A-Za-z0-9]/.test(p)) score++;
    return Math.min(score, 4); // 0..4
  }, [form.password]);

  const pwStrength = ["Very weak", "Weak", "Okay", "Good", "Strong"][pwScore] || "Very weak";
  const pwBarWidth = ["10%", "30%", "55%", "80%", "100%"][pwScore];
  const pwBarClass = ["bg-danger", "bg-danger", "bg-warning", "bg-info", "bg-success"][pwScore];

  const validate = () => {
    if (!form.username.trim()) return "Username is required";
    if (!form.email.trim()) return "Email is required";
    if (!/.+@.+\..+/.test(form.email)) return "Enter a valid email address";
    if (!form.password) return "Password is required";
    if (form.password.length < 8) return "Password must be at least 8 characters";
    if (form.password !== form.confirm) return "Passwords do not match";
    if (!form.agree) return "You must agree to the Terms to continue";
    return "";
  };

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    const v = validate();
    if (v) return setError(v);

    setLoading(true);
    try {
      const { data } = await api.post("/api/v1/auth/register", {
        username: form.username.trim(),
        email: form.email.trim(),
        password: form.password,
      });
      // auto-login then go to dashboard
      login(data);
      nav("/login");
    } catch (e) {
      setError(e?.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-vh-100 d-flex align-items-center bg-light">
      <div className="container py-5">
        <div className="row justify-content-center">
          <motion.div
            className="col-lg-6 col-md-8"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
          >
            <div className="card border-0 shadow-lg">
              <div className="card-body p-4 p-md-5">
                {/* Header */}
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05, duration: 0.3 }}
                  className="text-center mb-4"
                >
                  <div className="d-inline-flex align-items-center justify-content-center rounded-circle bg-primary bg-opacity-10 p-3 mb-2">
                    <i className="bi bi-person-plus-fill fs-3 text-primary"></i>
                  </div>
                  <h3 className="fw-bold mb-0">Create your account</h3>
                  <div className="text-muted small">Join CV Builder and craft your resume in minutes</div>
                </motion.div>

                {/* Form */}
                <form onSubmit={submit} className="vstack gap-3">
                  <div>
                    <label className="form-label small text-muted">Username</label>
                    <input
                      type="text"
                      name="username"
                      className="form-control form-control-lg"
                      placeholder="JaneDoe"
                      value={form.username}
                      onChange={onChange}
                      autoComplete="username"
                    />
                  </div>

                  <div>
                    <label className="form-label small text-muted">Email</label>
                    <input
                      type="email"
                      name="email"
                      className="form-control form-control-lg"
                      placeholder="you@example.com"
                      value={form.email}
                      onChange={onChange}
                      autoComplete="email"
                    />
                  </div>

                  <div>
                    <label className="form-label small text-muted">Password</label>
                    <div className="input-group input-group-lg">
                      <span className="input-group-text">
                        <i className="bi bi-lock-fill"></i>
                      </span>
                      <input
                        type={showPw ? "text" : "password"}
                        name="password"
                        className="form-control"
                        placeholder="At least 8 characters"
                        value={form.password}
                        onChange={onChange}
                        autoComplete="new-password"
                      />
                      <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={() => setShowPw((s) => !s)}
                        aria-label={showPw ? "Hide password" : "Show password"}
                        tabIndex={-1}
                      >
                        <i className={`bi ${showPw ? "bi-eye-slash" : "bi-eye"}`}></i>
                      </button>
                    </div>
                    {/* Strength meter */}
                    <div className="progress mt-2" style={{ height: 8 }}>
                      <div
                        className={`progress-bar ${pwBarClass}`}
                        role="progressbar"
                        style={{ width: pwBarWidth }}
                        aria-valuemin="0"
                        aria-valuemax="100"
                        aria-valuenow={(pwScore / 4) * 100}
                      />
                    </div>
                    <div className="small text-muted mt-1">{pwStrength}</div>
                  </div>

                  <div>
                    <label className="form-label small text-muted">Confirm Password</label>
                    <div className="input-group input-group-lg">
                      <span className="input-group-text">
                        <i className="bi bi-shield-lock-fill"></i>
                      </span>
                      <input
                        type={showPw2 ? "text" : "password"}
                        name="confirm"
                        className="form-control"
                        placeholder="Re-enter password"
                        value={form.confirm}
                        onChange={onChange}
                        autoComplete="new-password"
                      />
                      <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={() => setShowPw2((s) => !s)}
                        aria-label={showPw2 ? "Hide password" : "Show password"}
                        tabIndex={-1}
                      >
                        <i className={`bi ${showPw2 ? "bi-eye-slash" : "bi-eye"}`}></i>
                      </button>
                    </div>
                  </div>

                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="agree"
                      name="agree"
                      checked={form.agree}
                      onChange={onChange}
                    />
                    <label className="form-check-label" htmlFor="agree">
                      I agree to the{" "}
                      <Link to="/terms" className="text-decoration-none">
                        Terms & Conditions
                      </Link>{" "}
                      and{" "}
                      <Link to="/privacy" className="text-decoration-none">
                        Privacy Policy
                      </Link>
                      .
                    </label>
                  </div>

                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="alert alert-danger py-2 small mb-0"
                    >
                      <i className="bi bi-exclamation-triangle me-1"></i>
                      {error}
                    </motion.div>
                  )}

                  <button className="btn btn-primary btn-lg w-100" disabled={loading} type="submit">
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" />
                        Creating account…
                      </>
                    ) : (
                      "Create Account"
                    )}
                  </button>
                </form>

                {/* Footer */}
                <div className="text-center mt-4">
                  <span className="text-muted small">
                    Already have an account?{" "}
                    <Link to="/login" className="text-decoration-none fw-semibold">
                      Sign in
                    </Link>
                  </span>
                </div>
              </div>
            </div>

            <div className="text-center text-muted small mt-3">
              © {new Date().getFullYear()} CV Builder • All rights reserved
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
