import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import bgImage from "../assets/back1.jpg";
import Footer from "../components/Footer"; //  Import footer

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
      className="min-h-screen flex items-center justify-center bg-cover bg-center relative"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      {/* Dark overlay for readability */}
      <div className="absolute inset-0 bg-black/40"></div>

      {/* Login Card */}
      <div className="relative z-10 w-full max-w-md p-10 sm:p-12 rounded-2xl shadow-2xl border border-white/10 bg-gradient-to-br from-slate-900/90 via-slate-800/80 to-slate-900/90 backdrop-blur-md flex flex-col items-center">
        
        {/* Title */}
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white font-[Orbitron] drop-shadow-[0_0_12px_rgba(255,255,255,0.8)] hover:drop-shadow-[0_0_20px_rgba(34,211,238,0.8)] text-center mb-4">
          Crypterra
        </h1>
        <p className="text-center text-gray-400 mb-8 text-sm">
          Sign in to access your secure cloud dashboard
        </p>

        {/* Error Message */}
        {error && (
          <div className="text-red-400 mb-4 text-center font-medium animate-pulse">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="w-full space-y-6">
          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-medium text-gray-300">
              Email Address
            </label>
            <div className="relative">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-100 mb-1 drop-shadow"
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
                className="border border-slate-700/70 bg-slate-900/60 p-3 w-full rounded-lg text-gray-100 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/40 transition-all duration-200 placeholder-gray-500"
              />
              <span className="absolute right-3 top-3 text-cyan-400 text-lg">✉️</span>
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="block text-sm font-medium text-gray-300">
              Password
            </label>
            <div className="relative">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-100 mb-1 drop-shadow"
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
                className="border border-slate-700/70 bg-slate-900/60 p-3 w-full rounded-lg text-gray-100 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-500/40 transition-all duration-200 placeholder-gray-500"
              />
              <span className="absolute right-3 top-3 text-purple-400 text-lg">🔒</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-lg font-semibold transition-all duration-300 shadow-lg
              ${loading ? "bg-slate-700 cursor-not-allowed" : "bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-700 hover:scale-[1.03]"}
              text-white focus:ring-2 focus:ring-cyan-500/50`}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        {/* Footer Links */}
        <div className="text-center mt-8 space-y-3">
          <p className="text-gray-400 text-sm">
            Don’t have an account?{" "}
            <Link
              to="/signup"
              className="text-cyan-400 font-semibold hover:underline hover:text-purple-400 transition"
            >
              Sign up
            </Link>
          </p>

          <Link
            to="/forgot-password"
            className="text-sm text-gray-500 hover:text-cyan-400 hover:underline"
          >
            Forgot your password?
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;