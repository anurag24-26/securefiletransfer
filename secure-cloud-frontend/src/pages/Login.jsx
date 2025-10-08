import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../contexts/AuthContext";
import api from "../services/api";

// Import two different images
import sideImageLogin from "../assets/loginsideimage1.jpg";
import sideImageSignup from "../assets/signup.jpg";
import bgImage from "../assets/back1.jpg";

const AuthPage = () => {
  const navigate = useNavigate();
  const { login, loading, error: loginError } = useAuth();
  const [mode, setMode] = useState("login"); // "login" or "signup"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [signupData, setSignupData] = useState({
    name: "",
    email: "",
    password: "",
    role: "user",
  });
  const [signupError, setSignupError] = useState("");

  const roles = [
    { value: "user", label: "User" },
    { value: "deptAdmin", label: "Department Admin" },
    { value: "orgAdmin", label: "Organization Admin" },
    { value: "superAdmin", label: "Super Admin" },
  ];

  const handleLogin = async (e) => {
    e.preventDefault();
    const success = await login(email, password);
    if (success) navigate("/");
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setSignupError("");
    try {
      await api.post("/auth/signup", signupData);
      setMode("login");
    } catch (err) {
      setSignupError(err.response?.data?.message || "Signup failed");
    }
  };

  const toggleMode = () => setMode(mode === "login" ? "signup" : "login");

  // ✅ Choose image based on mode
  const currentSideImage = mode === "login" ? sideImageLogin : sideImageSignup;

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center relative overflow-hidden"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <div className="absolute inset-0 bg-black/40"></div>

      <div className="relative w-full max-w-5xl flex rounded-3xl shadow-2xl overflow-hidden border border-gray-200 bg-white/30 backdrop-blur-xl z-10">
        {/* Left Section (Dynamic Image + Info) */}
        <motion.div
          key={mode}
          initial={{ x: mode === "login" ? "100%" : "-100%", opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: mode === "login" ? "-100%" : "100%", opacity: 0 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className={`hidden md:flex w-1/2 flex-col justify-center items-center p-12 text-center bg-gradient-to-tr from-blue-50/60 to-indigo-50/60 ${
            mode === "login" ? "order-2" : "order-1"
          }`}
        >
          {/* ✅ Dynamic image */}
          <img
            src={currentSideImage}
            alt={mode === "login" ? "Login illustration" : "Signup illustration"}
            className="max-w-xs w-full mb-6 rounded-2xl shadow-xl transform hover:scale-105 transition duration-500"
          />

          <h3 className="text-2xl font-semibold text-gray-800 mb-2">
            {mode === "login" ? "Monitor Your Projects" : "Collaborate Securely"}
          </h3>
          <p className="text-gray-500 text-sm max-w-sm">
            {mode === "login"
              ? "Track your cloud analytics, manage files securely, and visualize data effortlessly."
              : "Manage your organization’s cloud projects safely with Crypterra’s encryption tools."}
          </p>
        </motion.div>

        {/* Right Section (Forms) */}
        <motion.div
          key={mode + "-form"}
          initial={{ x: mode === "login" ? "-100%" : "100%", opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: mode === "login" ? "100%" : "-100%", opacity: 0 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className={`w-full md:w-1/2 p-10 flex flex-col justify-center relative z-10 ${
            mode === "login" ? "order-1" : "order-2"
          }`}
        >
          {mode === "login" ? (
            <>
              <h2 className="text-3xl font-bold text-gray-100 mb-3 text-center md:text-left drop-shadow-lg">
                Welcome Back
              </h2>
              <p className="text-gray-200 text-sm mb-10 text-center md:text-left drop-shadow">
                Sign in to access your secure cloud dashboard
              </p>

              {loginError && (
                <div className="text-red-400 text-center mb-4 font-medium animate-pulse">
                  {loginError}
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-6">
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-100 mb-1"
                  >
                    Email Address
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                    className="w-full px-5 py-3 rounded-2xl border border-gray-200 bg-white/40 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  />
                </div>

                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-gray-100 mb-1"
                  >
                    Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                    className="w-full px-5 py-3 rounded-2xl border border-gray-200 bg-white/40 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  />
                  <div className="text-right mt-2">
                    <Link
                      to="/forgot-password"
                      className="text-sm text-indigo-200 hover:underline"
                    >
                      Forgot password?
                    </Link>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full py-3 rounded-2xl text-white font-semibold shadow-lg transition-all duration-300 transform ${
                    loading
                      ? "bg-indigo-300 cursor-not-allowed"
                      : "bg-gradient-to-r from-indigo-500 to-blue-500 hover:scale-105 hover:from-indigo-600 hover:to-blue-600"
                  }`}
                >
                  {loading ? "Logging in..." : "Login"}
                </button>
              </form>

              <p className="text-center text-sm text-gray-200 mt-8">
                Don’t have an account?{" "}
                <button
                  onClick={toggleMode}
                  className="text-indigo-200 font-medium hover:underline"
                >
                  Sign up
                </button>
              </p>
            </>
          ) : (
            <>
              <h2 className="text-3xl font-bold text-gray-100 mb-3 text-center md:text-left drop-shadow-lg">
                Create Account
              </h2>
              <p className="text-gray-200 text-sm mb-10 text-center md:text-left drop-shadow">
                Join Crypterra — your secure cloud collaboration platform
              </p>

              {signupError && (
                <div className="text-red-400 text-center mb-4 font-medium animate-pulse">
                  {signupError}
                </div>
              )}

              <form onSubmit={handleSignup} className="space-y-6">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-gray-100 mb-1"
                  >
                    Full Name
                  </label>
                  <input
                    id="name"
                    type="text"
                    name="name"
                    value={signupData.name}
                    onChange={(e) =>
                      setSignupData({ ...signupData, name: e.target.value })
                    }
                    placeholder="Enter your full name"
                    required
                    className="w-full px-5 py-3 rounded-2xl border border-gray-200 bg-white/40 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  />
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-100 mb-1"
                  >
                    Email Address
                  </label>
                  <input
                    id="email"
                    type="email"
                    name="email"
                    value={signupData.email}
                    onChange={(e) =>
                      setSignupData({ ...signupData, email: e.target.value })
                    }
                    placeholder="Enter your email"
                    required
                    className="w-full px-5 py-3 rounded-2xl border border-gray-200 bg-white/40 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  />
                </div>

                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-gray-100 mb-1"
                  >
                    Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    name="password"
                    value={signupData.password}
                    onChange={(e) =>
                      setSignupData({
                        ...signupData,
                        password: e.target.value,
                      })
                    }
                    placeholder="Create a password"
                    required
                    className="w-full px-5 py-3 rounded-2xl border border-gray-200 bg-white/40 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  />
                </div>

                <div>
                  <label
                    htmlFor="role"
                    className="block text-sm font-medium text-gray-100 mb-1"
                  >
                    Select Role
                  </label>
                  <select
                    id="role"
                    name="role"
                    value={signupData.role}
                    onChange={(e) =>
                      setSignupData({ ...signupData, role: e.target.value })
                    }
                    className="w-full px-5 py-3 rounded-2xl border border-gray-200 bg-white/40 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  >
                    {roles.map((r) => (
                      <option key={r.value} value={r.value}>
                        {r.label}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-2xl text-white font-semibold shadow-lg bg-gradient-to-r from-blue-500 to-indigo-600 hover:scale-105 hover:from-indigo-600 hover:to-blue-700 transition-all duration-300"
                >
                  Sign Up
                </button>
              </form>

              <p className="text-center text-sm text-gray-200 mt-8">
                Already have an account?{" "}
                <button
                  onClick={toggleMode}
                  className="text-indigo-200 font-medium hover:underline"
                >
                  Login
                </button>
              </p>
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default AuthPage;
