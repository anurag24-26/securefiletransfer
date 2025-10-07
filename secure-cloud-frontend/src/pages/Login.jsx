import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

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
      className="min-h-screen flex items-center justify-center"
      style={{
        background: "linear-gradient(90deg, #0f2027 0%, #2c5364 100%)",
        minHeight: "100vh",
      }}
    >
      <div className="shadow-2xl rounded-2xl p-8 max-w-md w-full"
        style={{
          background: "rgba(23, 27, 56, 0.97)",
          boxShadow: "0 4px 32px rgba(16,22,36,0.5)",
          border: "1px solid #29334d"
        }}
      >
        <h2
          className="text-3xl font-bold mb-6 text-center"
          style={{
            background: "linear-gradient(90deg, #21d4fd 0%, #b721ff 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent"
          }}
        >
          Login
        </h2>
        {error && <div className="text-red-500 mb-4 text-center">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-5">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border p-3 w-full rounded-lg focus:outline-blue-400 text-gray-100 bg-slate-800 border-slate-700 
    transition duration-300 ease-in-out
    hover:bg-slate-700 hover:border-cyan-400"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border p-3 w-full rounded-lg focus:outline-blue-400 text-gray-100 bg-slate-800 border-slate-700 
    transition duration-300 ease-in-out
    hover:bg-slate-700 hover:border-purple-400"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-cyan-500 to-purple-500 text-white py-3 rounded-lg font-semibold
    transition-all duration-300 shadow-lg
    hover:from-cyan-400 hover:to-purple-600 hover:scale-105 hover:shadow-2xl"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
        <p className="text-center mt-6 text-gray-400">
          Don’t have an account?{" "}
          <Link
            to="/signup"
            className="text-cyan-400 font-semibold hover:underline"
          >
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
