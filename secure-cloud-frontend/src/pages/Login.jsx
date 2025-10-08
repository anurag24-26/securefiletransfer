import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import sideImage from "../assets/loginsideimage1.jpg";
import bgImage from "../assets/back1.jpg"; // <-- your background image

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

      <div className="relative w-full max-w-5xl flex flex-col md:flex-row rounded-3xl shadow-2xl overflow-hidden border border-gray-200 bg-white/30 backdrop-blur-xl animate-fadeIn z-10">
        {/* Left Side – Login Form */}
        <div className="md:w-1/2 w-full p-12 flex flex-col justify-center relative z-10">
          <h2 className="text-3xl font-bold text-gray-100 mb-3 text-center md:text-left drop-shadow-lg">
            Welcome Back
          </h2>
          <p className="text-gray-200 text-sm mb-10 text-center md:text-left drop-shadow">
            Sign in to access your secure cloud dashboard
          </p>

          {error && (
            <div className="text-red-400 text-center mb-4 font-medium animate-pulse">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
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
                className="w-full px-5 py-3 rounded-2xl border border-gray-200 bg-white/40 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 shadow-sm transition duration-300 hover:shadow-md text-gray-900"
              />
            </div>

            {/* Password */}
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
                className="w-full px-5 py-3 rounded-2xl border border-gray-200 bg-white/40 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 shadow-sm transition duration-300 hover:shadow-md text-gray-900"
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

            {/* Button */}
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

          {/* Sign up */}
          <p className="text-center text-sm text-gray-200 mt-8 drop-shadow">
            Don’t have an account?{" "}
            <Link
              to="/signup"
              className="text-indigo-200 font-medium hover:underline"
            >
              Sign up
            </Link>
          </p>

          {/* Floating Circle Decoration */}
          <div className="absolute -top-10 -left-10 w-24 h-24 rounded-full bg-indigo-200/40 blur-3xl animate-pulse-slow"></div>
          <div className="absolute -bottom-10 -right-10 w-32 h-32 rounded-full bg-blue-200/40 blur-3xl animate-pulse-slow"></div>
        </div>

        {/* Right Side – Image & Text */}
        <div className="md:w-1/2 w-full flex flex-col justify-center items-center p-12 text-center bg-gradient-to-tr from-blue-50/60 to-indigo-50/60 relative overflow-hidden">
          <img
            src={sideImage}
            alt="Project Illustration"
            className="max-w-xs w-full mb-6 rounded-2xl shadow-xl transform hover:scale-105 transition duration-500"
          />
          <h3 className="text-2xl font-semibold text-gray-800 mb-2">
            Monitor Your Projects
          </h3>
          <p className="text-gray-500 text-sm max-w-sm">
            Track your cloud analytics, manage files securely, and visualize
            data insights effortlessly with our intuitive dashboard.
          </p>

          {/* Floating Decorative Circles */}
          <div className="absolute -top-10 right-5 w-20 h-20 rounded-full bg-indigo-100/50 blur-3xl animate-pulse-slow"></div>
          <div className="absolute bottom-0 -left-10 w-28 h-28 rounded-full bg-blue-100/50 blur-3xl animate-pulse-slow"></div>
        </div>
      </div>
    </div>
  );
};

export default Login;