import React, { createContext, useContext, useState, useEffect } from "react";
import api, { setAuthToken } from "../services/api";

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

// ✅ How long to keep the user logged in (7 days in ms)
const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  // ✅ CRITICAL: Start as TRUE so PrivateRoute waits before redirecting
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ✅ Restore login state on page reload
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const savedToken = localStorage.getItem("token");
        const savedExpiry = localStorage.getItem("tokenExpiry");
        const savedUser = localStorage.getItem("user");

        // Check if token exists and hasn't expired
        const isExpired = savedExpiry && Date.now() > parseInt(savedExpiry);

        if (!savedToken || isExpired) {
          // Clear stale data
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          localStorage.removeItem("tokenExpiry");
          return;
        }

        // Token is valid — restore session
        setAuthToken(savedToken);
        setToken(savedToken);

        if (savedUser) {
          setUser(JSON.parse(savedUser));
        } else {
          // Fallback: fetch user from backend
          const res = await api.get("/auth/me");
          setUser(res.data.user);
          localStorage.setItem("user", JSON.stringify(res.data.user));
        }
      } catch (err) {
        // If /auth/me fails (401), the interceptor in api.js handles cleanup
        setUser(null);
        setToken(null);
      } finally {
        // ✅ ALWAYS unblock the UI after checking
        setLoading(false);
      }
    };

    restoreSession();
  }, []);

  // ✅ Login — stores token with expiry timestamp
  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.post("/auth/login", { email, password });

      const expiry = Date.now() + SESSION_DURATION;

      setAuthToken(data.token);
      setToken(data.token);
      setUser(data.user);

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("tokenExpiry", expiry.toString());

      return true;
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Please try again.");
      return false;
    } finally {
      setLoading(false);
    }
  };

  // ✅ Logout — clears all auth state and storage
  const logout = () => {
    setUser(null);
    setToken(null);
    setAuthToken(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("tokenExpiry");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout,
        loading,
        error,
        setUser,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};