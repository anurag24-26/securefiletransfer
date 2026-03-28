import React, { createContext, useContext, useState, useEffect } from "react";
import api, { setAuthToken } from "../services/api";

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  // sessionLoading = true ONLY during the initial page-load token restore
  // This is what PrivateRoute watches — must start true, set false once checked
  const [sessionLoading, setSessionLoading] = useState(true);

  // loginLoading = true only while the login API call is in-flight
  // Used by the Login button spinner — does NOT block PrivateRoute
  const [loginLoading, setLoginLoading] = useState(false);

  const [error, setError] = useState(null);

  // Restore session on page reload
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const savedToken = localStorage.getItem("token");
        const savedExpiry = localStorage.getItem("tokenExpiry");
        const savedUser = localStorage.getItem("user");

        const isExpired =
          savedExpiry && Date.now() > parseInt(savedExpiry, 10);

        if (!savedToken || isExpired) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          localStorage.removeItem("tokenExpiry");
          return; // finally still runs
        }

        setAuthToken(savedToken);
        setToken(savedToken);

        if (savedUser) {
          try {
            setUser(JSON.parse(savedUser));
          } catch {
            // Corrupted JSON — fetch fresh from backend
            const res = await api.get("/auth/me");
            setUser(res.data.user);
            localStorage.setItem("user", JSON.stringify(res.data.user));
          }
        } else {
          const res = await api.get("/auth/me");
          setUser(res.data.user);
          localStorage.setItem("user", JSON.stringify(res.data.user));
        }
      } catch {
        // 401 is handled by api.js interceptor — just clear state here
        setUser(null);
        setToken(null);
      } finally {
        // ALWAYS unblock PrivateRoute after session check completes
        setSessionLoading(false);
      }
    };

    restoreSession();
  }, []);

  const login = async (email, password) => {
    setLoginLoading(true); // only loginLoading, NOT sessionLoading
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
      setError(
        err.response?.data?.message || "Login failed. Please try again."
      );
      return false;
    } finally {
      setLoginLoading(false);
    }
  };

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
        loading: loginLoading,   // AuthPage uses this for the button spinner
        sessionLoading,          // PrivateRoute uses this to wait on page refresh
        error,
        setUser,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};