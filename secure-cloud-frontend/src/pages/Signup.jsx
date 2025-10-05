import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";

const Signup = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "user",
    joinCode: "",
  });
  const [error, setError] = useState("");

  const roles = [
    { value: "user", label: "User" },
    { value: "deptAdmin", label: "Department Admin" },
    { value: "orgAdmin", label: "Organization Admin" },
    { value: "superAdmin", label: "Super Admin" },
  ];

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const payload = form.role === "user"
        ? form
        : { name: form.name, email: form.email, password: form.password, role: form.role };
      await api.post("/auth/signup", payload);
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.message || "Signup failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="bg-white shadow-lg rounded-2xl p-8 max-w-md w-full">
        <h2 className="text-3xl font-bold mb-6 text-center">Sign Up</h2>
        {error && <div className="text-red-600 mb-4 text-center">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-5">
          <input
            type="text"
            name="name"
            placeholder="Full Name"
            value={form.name}
            onChange={handleChange}
            className="border p-3 w-full rounded-lg focus:outline-green-500"
            required
            autoFocus
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            className="border p-3 w-full rounded-lg focus:outline-green-500"
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            className="border p-3 w-full rounded-lg focus:outline-green-500"
            required
          />
          <select
            name="role"
            value={form.role}
            onChange={handleChange}
            className="border p-3 w-full rounded-lg"
            required
          >
            {roles.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
          {form.role === "user" && (
            <input
              type="text"
              name="joinCode"
              placeholder="Department Join Code"
              value={form.joinCode}
              onChange={handleChange}
              className="border p-3 w-full rounded-lg"
              required
            />
          )}
          <button
            type="submit"
            className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold transition"
          >
            Sign Up
          </button>
        </form>
        <p className="text-center mt-6 text-gray-600">
          Already have an account?{" "}
          <Link to="/login" className="text-green-600 font-semibold hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
