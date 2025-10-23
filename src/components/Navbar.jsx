import React from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Navbar() {
  const { user, logout } = useAuth();
  const nav = useNavigate();

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-white shadow-sm sticky-top">
      <div className="container py-2">
        {/* Brand */}
        <Link to="/" className="navbar-brand fw-bold text-primary fs-4 d-flex align-items-center">
          <i className="bi bi-person-vcard-fill me-2 text-primary"></i>
          CV Builder
        </Link>

        {/* Toggler for mobile */}
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* Nav Links */}
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <NavLink end to="/" className="nav-link">
                Home
              </NavLink>
            </li>
            {user && (
              <>
                <li className="nav-item">
                  <NavLink to="/dashboard" className="nav-link">
                    Dashboard
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink to="/editor" className="nav-link">
                    Create CV
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink to="/layouts" className="nav-link">
                    Layouts
                  </NavLink>
                </li>
              </>
            )}
          </ul>

          {/* Right section */}
          <ul className="navbar-nav ms-auto align-items-center">
            {!user ? (
              <>
                <li className="nav-item">
                  <NavLink to="/login" className="nav-link fw-semibold text-primary">
                    Login
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink to="/register" className="btn btn-primary px-3 ms-2">
                    Register
                  </NavLink>
                </li>
              </>
            ) : (
              <li className="nav-item d-flex align-items-center gap-3">
                <span className="text-muted small">
                  <i className="bi bi-person-circle me-1 text-primary"></i>
                  Hi, {user.username}
                </span>
                <button
                  className="btn btn-sm btn-outline-secondary"
                  onClick={() => {
                    logout();
                    nav("/login");
                  }}
                >
                  Logout
                </button>
              </li>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}
