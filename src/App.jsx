import React from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";

import Navbar from "./components/Navbar.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Editor from "./pages/Editor.jsx";
import Share from "./pages/Share.jsx";
import Layouts from "./pages/Layouts.jsx";
import NotFound from "./pages/NotFound.jsx";
import Home from "./pages/Home.jsx";
import PublicView from "./pages/PublicView.jsx";
import OAuthSuccess from './pages/OAuthSuccess.jsx';



import { AuthProvider, useAuth } from "./context/AuthContext.jsx";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PK);

function Protected({ children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

// ✅ Custom wrapper to conditionally show Navbar
function AppContent() {
  const location = useLocation();
  const hideNavbar = ["/login", "/register"].includes(location.pathname);

  return (
    <>
      {!hideNavbar && <Navbar />}
      <div className="container-fluid p-0">
        <Routes>
          <Route path="/oauth-success" element={<OAuthSuccess />} />
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Protected><Dashboard /></Protected>} />
          <Route path="/layouts" element={<Layouts />} />
          <Route path="/editor/:id?" element={<Protected><Editor /></Protected>} />
          <Route path="/share/:id" element={<Protected><Share /></Protected>} />
          <Route path="/view/:id" element={<PublicView />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Elements stripe={stripePromise}>
        <AppContent />
      </Elements>
    </AuthProvider>
  );
}
