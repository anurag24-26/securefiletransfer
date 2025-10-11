import React, { createContext, useContext, useState, useEffect } from "react";
import api, { setAuthToken } from "../services/api";

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 🔹 Restore login state on page reload
  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");

    if (savedToken) {
      setAuthToken(savedToken);
      setToken(savedToken);
      if (savedUser) setUser(JSON.parse(savedUser));
      else {
        // optional: fetch user info from backend if not stored
        api
          .get("/auth/me")
          .then((res) => setUser(res.data.user))
          .catch(() => setUser(null));
      }
    }
  }, []);

  // 🔹 Login function
  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.post("/auth/login", { email, password });

      // Ensure axios header is ready before proceeding
      setAuthToken(data.token);
      setToken(data.token);
      setUser(data.user);

      // Persist data
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      return true;
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
      return false;
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Logout function
  const logout = () => {
    setUser(null);
    setToken(null);
    setAuthToken(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
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
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
