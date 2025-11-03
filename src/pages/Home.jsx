import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import Logoo from "../../public/images/looogo.png";
import { useAuth } from "../context/AuthContext.jsx";

export default function Home() {
  const { isAuthenticated } = useAuth();
  return (
    <>
      {/* Hero Section */}
      <section className="py-5 hero-section text-center text-md-start">
        <div className="container">
          <div className="row align-items-center">
            <motion.div
              className="col-md-7 text-md-start text-center"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="display-4 fw-bold text-white mb-3">
                Build Your Professional CV Instantly
              </h1>
              <p className="lead text-white-75 mb-4">
                Create, edit, download, and share stunning CVs in minutes with our
                modern layouts and easy-to-use editor.
              </p>
              <div className="d-flex gap-3 justify-content-center justify-content-md-start">
                {!isAuthenticated ? (
                  <>
                    <Link to="/register" className="btn btn-light btn-lg text-primary">
                      Get Started
                    </Link>
                    <Link to="/login" className="btn btn-outline-light btn-lg">
                      Sign In
                    </Link>
                  </>
                ) : (
                  <>
                    <Link to="/dashboard" className="btn btn-light btn-lg text-primary">
                      Go to Dashboard
                    </Link>
                    <Link to="/editor" className="btn btn-outline-light btn-lg">
                      Create CV
                    </Link>
                  </>
                )}
              </div>
            </motion.div>

            <motion.div
              className="col-md-5 text-center mt-4 mt-md-0"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
            >
              <div className="shadow-lg rounded-3 overflow-hidden hero-illustration d-inline-block">
                <img
                  src={Logoo}
                  alt="CV Builder preview"
                  className="img-fluid"
                  style={{ maxWidth: "420px", display: "block" }}
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-5">
        <div className="container text-center">
          <h2 className="fw-bold mb-5">Why Choose Our CV Builder?</h2>
          <div className="row g-4">
            <div className="col-md-3">
              <motion.div className="card border-0 h-100 shadow-sm" whileHover={{ translateY: -6 }} transition={{ duration: 0.15 }}>
                <div className="card-body">
                  <div className="mb-3 text-primary fs-3">
                    <i className="bi bi-person-lines-fill"></i>
                  </div>
                  <h5 className="card-title fw-semibold">Smart Editor</h5>
                  <p className="card-text text-muted">
                    Step-by-step form with real-time preview to craft your CV
                    effortlessly.
                  </p>
                </div>
              </motion.div>
            </div>
            <div className="col-md-3">
              <motion.div className="card border-0 h-100 shadow-sm" whileHover={{ translateY: -6 }} transition={{ duration: 0.15 }}>
                <div className="card-body">
                  <div className="mb-3 text-success fs-3">
                    <i className="bi bi-layout-text-window"></i>
                  </div>
                  <h5 className="card-title fw-semibold">Multiple Layouts</h5>
                  <p className="card-text text-muted">
                    Choose from elegant predefined templates to match your style
                    and industry.
                  </p>
                </div>
              </motion.div>
            </div>
            <div className="col-md-3">
              <motion.div className="card border-0 h-100 shadow-sm" whileHover={{ translateY: -6 }} transition={{ duration: 0.15 }}>
                <div className="card-body">
                  <div className="mb-3 text-warning fs-3">
                    <i className="bi bi-cloud-arrow-down"></i>
                  </div>
                  <h5 className="card-title fw-semibold">Instant Download</h5>
                  <p className="card-text text-muted">
                    Download your CV as a professional-quality PDF with one
                    click.
                  </p>
                </div>
              </motion.div>
            </div>
            <div className="col-md-3">
              <motion.div className="card border-0 h-100 shadow-sm" whileHover={{ translateY: -6 }} transition={{ duration: 0.15 }}>
                <div className="card-body">
                  <div className="mb-3 text-danger fs-3">
                    <i className="bi bi-share"></i>
                  </div>
                  <h5 className="card-title fw-semibold">Share Anywhere</h5>
                  <p className="card-text text-muted">
                    Share your CV instantly via link or email — perfect for job
                    applications and networking.
                  </p>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <motion.section className="py-5 cta-section text-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
        <div className="container">
          <h3 className="fw-bold mb-2">Ready to Create Your CV?</h3>
          <p className="mb-3 text-muted">
            Join thousands of professionals using our CV Builder to land their
            dream jobs.
          </p>
          {!isAuthenticated ? (
            <Link to="/register" className="btn btn-primary btn-lg px-4">
              Start Building Now
            </Link>
          ) : (
            <div className="d-flex justify-content-center gap-2">
              <Link to="/dashboard" className="btn btn-outline-primary btn-lg">Go to Dashboard</Link>
              <Link to="/editor" className="btn btn-primary btn-lg">Create CV</Link>
            </div>
          )}
        </div>
      </motion.section>
    </>
  );
}
