import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import api from "../services/api.js";

// ✅ The backend now stores tokens in HTTP-only cookies.
// So we only need to manage `user` info on the client.

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // ---- Fetch current user (session hydration) ----
  const fetchMe = useCallback(async () => {
    try {
      const { data } = await api.get("/api/v1/auth/me", { withCredentials: true });
      if (data?.user) {
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch (err) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMe();
  }, [fetchMe]);

  // ---- LOGIN ----
  const login = useCallback(async (credentials) => {
    try {
      const { data } = await api.post("/api/v1/auth/login", credentials, {
        withCredentials: true,
      });
      setUser(data.user);
      return { success: true };
    } catch (err) {
      console.error("Login failed", err);
      return { success: false, message: err?.response?.data?.message || "Login failed" };
    }
  }, []);

  // ---- REGISTER ----
  const register = useCallback(async (payload) => {
    try {
      const { data } = await api.post("/api/v1/auth/register", payload, {
        withCredentials: true,
      });
      setUser(data.user);
      return { success: true };
    } catch (err) {
      console.error("Registration failed", err);
      return { success: false, message: err?.response?.data?.message || "Registration failed" };
    }
  }, []);

  // ---- LOGOUT ----
  const logout = useCallback(async () => {
    try {
      await api.post("/api/v1/auth/logout", {}, { withCredentials: true });
    } catch (err) {
      console.warn("Logout failed (ignored)", err);
    } finally {
      setUser(null);
    }
  }, []);

  const isAuthenticated = !!user;

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
    refreshUser: fetchMe,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
