import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import bgImage from "../assets/bg.jpg";

const Login = () => {
  const { login, loading, error } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await login(email, password);
    if (success) navigate("/");
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center relative bg-cover bg-center"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      {/* Soft white overlay for readability */}
      <div className="absolute inset-0 bg-white/30 backdrop-blur-[3px]" />

      {/* Login Card */}
      <div className="relative z-10 w-full max-w-md p-10 sm:p-12 rounded-2xl shadow-2xl border border-white/40 bg-white/70 backdrop-blur-lg flex flex-col items-center">
        
        {/* Title */}
        <h1 className="text-4xl font-extrabold text-gray-800 font-[Orbitron] text-center mb-4 drop-shadow-[0_0_8px_rgba(0,0,0,0.2)]">
          Crypterra
        </h1>
        <p className="text-center text-gray-600 mb-8 text-sm">
          Sign in to access your secure cloud dashboard
        </p>

        {/* Error Message */}
        {error && (
          <div className="text-red-500 mb-4 text-center font-medium animate-pulse">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="w-full space-y-6">
          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email Address
            </label>
            <div className="relative">
              <input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="border border-gray-300 bg-white/80 p-3 w-full rounded-lg text-gray-800 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-300 transition-all duration-200 placeholder-gray-400"
              />
              <span className="absolute right-3 top-3 text-cyan-500 text-lg">✉️</span>
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="border border-gray-300 bg-white/80 p-3 w-full rounded-lg text-gray-800 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-300 transition-all duration-200 placeholder-gray-400"
              />
              <span className="absolute right-3 top-3 text-purple-500 text-lg">🔒</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-lg font-semibold transition-all duration-300 shadow-md
              ${
                loading
                  ? "bg-gray-300 cursor-not-allowed text-gray-600"
                  : "bg-gradient-to-r from-cyan-400 to-purple-500 hover:from-cyan-500 hover:to-purple-600 hover:scale-[1.03] text-white"
              }
              focus:ring-2 focus:ring-cyan-300`}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        {/* Footer Links */}
        <div className="text-center mt-8 space-y-3">
          <p className="text-gray-600 text-sm">
            Don’t have an account?{" "}
            <Link
              to="/signup"
              className="text-cyan-600 font-semibold hover:underline hover:text-purple-500 transition"
            >
              Create one
            </Link>
          </p>

          <Link
            to="/forgot-password"
            className="text-sm text-gray-500 hover:text-cyan-600 hover:underline"
          >
            Forgot your password?
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
