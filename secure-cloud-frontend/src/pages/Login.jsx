// AuthPage.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../contexts/AuthContext";
import api from "../services/api";

// Images
import sideImageLogin from "../assets/login.svg";
import sideImageSignup from "../assets/signup.svg";
import bgImage from "../assets/back1.jpg";

const AuthPage = () => {
  const navigate = useNavigate();
  const { login, loading, error: loginError } = useAuth();
  const [isLogin, setIsLogin] = useState(true);

  // Login form
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Signup form
  const [signupData, setSignupData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [signupError, setSignupError] = useState("");

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
      setIsLogin(true);
    } catch (err) {
      setSignupError(err.response?.data?.message || "Signup failed");
    }
  };

  const switchMode = () => setIsLogin(!isLogin);

  const handleForgotPassword = () => {
    navigate("/forgot-password");
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <div className="relative flex flex-col md:flex-row bg-white/20 backdrop-blur-md rounded-3xl shadow-2xl overflow-hidden max-w-5xl w-full mx-4 border border-white/30">
        {/* Left Side Image */}
        <motion.div
          key={isLogin ? "login-image" : "signup-image"}
          layout
          initial={{ opacity: 0, scale: 0.9, x: isLogin ? -100 : 100 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          exit={{ opacity: 0, scale: 0.9, x: isLogin ? 100 : -100 }}
          transition={{
            type: "spring",
            stiffness: 80,
            damping: 18,
            duration: 0.6,
          }}
          className="hidden md:flex md:w-1/2 justify-center items-center"
        >
          {isLogin ? (
            <img
              src={sideImageLogin}
              alt="Login illustration"
              className="w-3/4 h-3/4 object-contain"
            />
          ) : (
            <img
              src={sideImageSignup}
              alt="Signup illustration"
              className="w-3/4 h-3/4 object-contain"
            />
          )}
        </motion.div>

        {/* Right Side Form */}
        <motion.div
          layout
          className="flex flex-col justify-center items-center p-10 md:w-1/2 w-full"
          transition={{ type: "spring", stiffness: 100, damping: 20 }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={isLogin ? "login-form" : "signup-form"}
              initial={{ opacity: 0, y: 40, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -40, scale: 0.95 }}
              transition={{
                type: "spring",
                stiffness: 120,
                damping: 20,
                duration: 0.6,
              }}
              className="w-full max-w-sm"
            >
              {isLogin ? (
                <>
                  <h2 className="text-3xl font-bold text-white text-center mb-4 drop-shadow-md">
                    Welcome Back
                  </h2>
                  <p className="text-gray-200 text-center mb-6">
                    Sign in to access your secure dashboard
                  </p>

                  {loginError && (
                    <p className="text-red-400 text-center mb-4 font-medium animate-pulse">
                      {loginError}
                    </p>
                  )}

                  <form onSubmit={handleLogin} className="space-y-5">
                    <input
                      type="email"
                      placeholder="Email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full p-3 rounded-xl bg-white/20 placeholder-gray-200 text-white focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                      required
                    />
                    <input
                      type="password"
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full p-3 rounded-xl bg-white/20 placeholder-gray-200 text-white focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                      required
                    />

                    <div className="flex justify-end text-sm">
                      <button
                        type="button"
                        onClick={handleForgotPassword}
                        className="text-blue-300 hover:text-blue-400 transition font-medium"
                      >
                        Forgot Password?
                      </button>
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      type="submit"
                      disabled={loading}
                      className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold shadow-lg hover:bg-blue-700 transition"
                    >
                      {loading ? "Logging in..." : "Login"}
                    </motion.button>
                  </form>

                  <div className="text-center mt-5">
                    <p className="text-white">
                      Don’t have an account?{" "}
                      <button
                        onClick={switchMode}
                        className="text-blue-300 font-medium hover:text-blue-400 transition"
                      >
                        Sign Up
                      </button>
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <h2 className="text-3xl font-bold text-white text-center mb-4 drop-shadow-md">
                    Create Account
                  </h2>
                  <p className="text-gray-200 text-center mb-6">
                    Join Crypterra — your secure cloud collaboration platform
                  </p>

                  {signupError && (
                    <p className="text-red-400 text-center mb-4 font-medium animate-pulse">
                      {signupError}
                    </p>
                  )}

                  <form onSubmit={handleSignup} className="space-y-5">
                    <input
                      type="text"
                      placeholder="Full Name"
                      value={signupData.name}
                      onChange={(e) =>
                        setSignupData({ ...signupData, name: e.target.value })
                      }
                      className="w-full p-3 rounded-xl bg-white/20 placeholder-gray-200 text-white focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                      required
                    />
                    <input
                      type="email"
                      placeholder="Email"
                      value={signupData.email}
                      onChange={(e) =>
                        setSignupData({ ...signupData, email: e.target.value })
                      }
                      className="w-full p-3 rounded-xl bg-white/20 placeholder-gray-200 text-white focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                      required
                    />
                    <input
                      type="password"
                      placeholder="Password"
                      value={signupData.password}
                      onChange={(e) =>
                        setSignupData({
                          ...signupData,
                          password: e.target.value,
                        })
                      }
                      className="w-full p-3 rounded-xl bg-white/20 placeholder-gray-200 text-white focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                      required
                    />

                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      type="submit"
                      className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-3 rounded-xl font-semibold shadow-lg hover:from-blue-600 hover:to-indigo-700 transition"
                    >
                      Sign Up
                    </motion.button>
                  </form>

                  <div className="text-center mt-5">
                    <p className="text-white">
                      Already have an account?{" "}
                      <button
                        onClick={switchMode}
                        className="text-blue-300 font-medium hover:text-blue-400 transition"
                      >
                        Login
                      </button>
                    </p>
                  </div>
                </>
              )}
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
};

export default AuthPage;
