import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";
import bgImage from "../assets/bg.jpg";

const Signup = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "user",
  });
  const [error, setError] = useState("");

  const roles = [
    { value: "user", label: "User" },
    { value: "deptAdmin", label: "Department Admin" },
    { value: "orgAdmin", label: "Organization Admin" },
    { value: "superAdmin", label: "Super Admin" },
  ];

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await api.post("/auth/signup", form);
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.message || "Signup failed");
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center relative bg-cover bg-center"
      style={{
        backgroundImage: `url(${bgImage})`,
      }}
    >
      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm"></div>

      {/* Signup Card */}
      <div
        className="relative z-10 w-full max-w-md p-10 sm:p-12 rounded-2xl shadow-2xl border border-white/10
        bg-gradient-to-br from-slate-900/90 via-slate-800/85 to-slate-900/90 backdrop-blur-md"
      >
        {/* Title */}
        <h2
          className="text-4xl font-extrabold mb-2 text-center tracking-tight"
          style={{
            background: "linear-gradient(90deg, #00e0ff, #b721ff)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Create Account
        </h2>
        <p className="text-center text-gray-400 mb-8 text-sm">
          Join Crypterra — your secure cloud collaboration platform
        </p>

        {/* Error Message */}
        {error && (
          <div className="text-red-400 mb-4 text-center font-medium animate-pulse">
            {error}
          </div>
        )}

        {/* Signup Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Name */}
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-300 mb-1"
            >
              Full Name
            </label>
            <input
              id="name"
              type="text"
              name="name"
              placeholder="Enter your full name"
              value={form.name}
              onChange={handleChange}
              className="border border-slate-700/70 bg-slate-900/60 p-3 w-full rounded-lg text-gray-100
              focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/40
              transition-all duration-200 placeholder-gray-500"
              required
            />
          </div>

          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-300 mb-1"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              name="email"
              placeholder="Enter your email"
              value={form.email}
              onChange={handleChange}
              className="border border-slate-700/70 bg-slate-900/60 p-3 w-full rounded-lg text-gray-100
              focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/40
              transition-all duration-200 placeholder-gray-500"
              required
            />
          </div>

          {/* Password */}
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-300 mb-1"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              name="password"
              placeholder="Create a password"
              value={form.password}
              onChange={handleChange}
              className="border border-slate-700/70 bg-slate-900/60 p-3 w-full rounded-lg text-gray-100
              focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-500/40
              transition-all duration-200 placeholder-gray-500"
              required
            />
          </div>

          {/* Role Selection */}
          <div>
            <label
              htmlFor="role"
              className="block text-sm font-medium text-gray-300 mb-1"
            >
              Select Role
            </label>
            <select
              id="role"
              name="role"
              value={form.role}
              onChange={handleChange}
              className="border border-slate-700/70 bg-slate-900/60 p-3 w-full rounded-lg text-gray-100
              focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/40
              transition-all duration-200"
              required
            >
              {roles.map((r) => (
                <option key={r.value} value={r.value} className="bg-slate-900">
                  {r.label}
                </option>
              ))}
            </select>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-cyan-500 to-purple-600 text-white py-3 rounded-lg font-semibold
            transition-all duration-300 shadow-lg hover:from-cyan-400 hover:to-purple-700 hover:scale-[1.03]
            hover:shadow-[0_0_18px_rgba(59,130,246,0.6)] focus:ring-2 focus:ring-cyan-500/50"
          >
            Sign Up
          </button>
        </form>

        {/* Footer Links */}
        <p className="text-center mt-8 text-gray-400 text-sm">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-cyan-400 font-semibold hover:underline hover:text-purple-400 transition"
          >
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
