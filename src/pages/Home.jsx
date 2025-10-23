import React from "react";
import { Link } from "react-router-dom";
import Logoo from "../../public/images/looogo.png";

export default function Home() {
  return (
    <>
      {/* Hero Section */}
      <section className="py-5 bg-light text-center text-md-start">
        <div className="container d-flex flex-column flex-md-row align-items-center justify-content-between">
          <div className="me-md-5">
            <h1 className="display-5 fw-bold mb-3 text-primary">
              Build Your Professional CV Instantly
            </h1>
            <p className="lead text-muted mb-4">
              Create, edit, download, and share stunning CVs in minutes with our
              modern layouts and easy-to-use editor.
            </p>
            <div className="d-flex gap-3">
              <Link to="/register" className="btn btn-primary btn-lg">
                Get Started
              </Link>
              <Link to="/login" className="btn btn-outline-secondary btn-lg">
                Sign In
              </Link>
            </div>
          </div>
          <img
            src={Logoo}

            
            alt="CV Builder preview"
            className="img-fluid mt-4 mt-md-0 rounded shadow"
            style={{ maxWidth: "450px" }}
          />
        </div>
      </section>

      {/* Features Section */}
      <section className="py-5">
        <div className="container text-center">
          <h2 className="fw-bold mb-5">Why Choose Our CV Builder?</h2>
          <div className="row g-4">
            <div className="col-md-3">
              <div className="card border-0 h-100 shadow-sm">
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
              </div>
            </div>
            <div className="col-md-3">
              <div className="card border-0 h-100 shadow-sm">
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
              </div>
            </div>
            <div className="col-md-3">
              <div className="card border-0 h-100 shadow-sm">
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
              </div>
            </div>
            <div className="col-md-3">
              <div className="card border-0 h-100 shadow-sm">
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
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-5 bg-primary text-white text-center">
        <div className="container">
          <h3 className="fw-bold mb-3">Ready to Create Your CV?</h3>
          <p className="mb-4">
            Join thousands of professionals using our CV Builder to land their
            dream jobs.
          </p>
          <Link to="/register" className="btn btn-light btn-lg px-4">
            Start Building Now
          </Link>
        </div>
      </section>
    </>
  );
}
