import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../services/api.js";
import { useAuth } from "../context/AuthContext.jsx";

export default function Login() {
  const nav = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({ email: "", password: "", remember: true });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }));
  };

  const validate = () => {
    if (!form.email.trim()) return "Email is required";
    if (!/.+@.+\..+/.test(form.email)) return "Enter a valid email address";
    if (!form.password) return "Password is required";
    return "";
  };

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    const v = validate();
    if (v) return setError(v);

    setLoading(true);
    try {
      const { data } = await api.post("/api/v1/auth/login", form);
      login(data);
      nav("/dashboard");
    } catch (e) {
      setError(e?.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      className="min-vh-100 d-flex align-items-center justify-content-center bg-light"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <div className="container">
        <div className="row justify-content-center py-5">
          <motion.div
            className="col-lg-5 col-md-7"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <motion.div
              className="card border-0 shadow-lg"
              whileHover={{ scale: 1.01 }}
              transition={{ type: "spring", stiffness: 200 }}
            >
              <div className="card-body p-4 p-md-5">
                {/* Header */}
                <motion.div
                  className="text-center mb-4"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1, duration: 0.4 }}
                >
                  <div className="d-inline-flex align-items-center justify-content-center rounded-circle bg-primary bg-opacity-10 p-3 mb-2">
                    <i className="bi bi-person-vcard-fill fs-3 text-primary"></i>
                  </div>
                  <h3 className="fw-bold mb-0">Welcome back</h3>
                  <div className="text-muted small">Sign in to continue to CV Builder</div>
                </motion.div>

                {/* Form */}
                <form onSubmit={submit} className="vstack gap-3">
                  <div>
                    <label className="form-label small text-muted">Email</label>
                    <input
                      name="email"
                      type="email"
                      className="form-control form-control-lg"
                      placeholder="you@example.com"
                      value={form.email}
                      onChange={onChange}
                    />
                  </div>

                  <div>
                    <label className="form-label small text-muted">Password</label>
                    <div className="input-group input-group-lg">
                      <input
                        name="password"
                        type={showPw ? "text" : "password"}
                        className="form-control"
                        placeholder="••••••••"
                        value={form.password}
                        onChange={onChange}
                      />
                      <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={() => setShowPw((s) => !s)}
                        tabIndex={-1}
                      >
                        <i className={`bi ${showPw ? "bi-eye-slash" : "bi-eye"}`}></i>
                      </button>
                    </div>
                    <div className="d-flex justify-content-between align-items-center mt-2">
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="remember"
                          name="remember"
                          checked={form.remember}
                          onChange={onChange}
                        />
                        <label className="form-check-label small" htmlFor="remember">
                          Remember me
                        </label>
                      </div>
                     
                    </div>
                  </div>

                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="alert alert-danger py-2 small mb-0"
                    >
                      <i className="bi bi-exclamation-triangle me-1"></i>
                      {error}
                    </motion.div>
                  )}

                  <motion.button
                    className="btn btn-primary btn-lg w-100"
                    disabled={loading}
                    type="submit"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    transition={{ type: "spring", stiffness: 200 }}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" />
                        Signing in…
                      </>
                    ) : (
                      "Sign in"
                    )}
                  </motion.button>
                </form>

                {/* Footer */}
                <div className="text-center mt-4">
                  <span className="text-muted small">
                    Don’t have an account?{" "}
                    <Link to="/register" className="text-decoration-none fw-semibold">
                      Create one
                    </Link>
                  </span>
                </div>
              </div>
            </motion.div>

            <div className="text-center text-muted small mt-3">
              © {new Date().getFullYear()} CV Builder • All rights reserved
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
