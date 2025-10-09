import React, { useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { HiOutlineLockClosed, HiOutlineMail } from "react-icons/hi";

// Local images
import bgImage from "../assets/back1.jpg";
import leftImage1 from "../assets/left1.svg";
import leftImage2 from "../assets/left2.svg";
import rightImage1 from "../assets/right1.svg";
import rightImage2 from "../assets/right2.svg";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (!email || !newPassword || !confirmPassword) {
      setError("All fields are required.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);
      const res = await axios.post("http://localhost:5000/api/auth/forgot-password", {
        email,
        newPassword,
        confirmPassword,
      });
      setMessage(res.data.message);
      setEmail("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const floatAnim = { y: [0, -15, 0, 15, 0] };

  return (
    <div
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
      style={{
        backgroundImage: `url(${bgImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* Left floating images */}
      <motion.div
        animate={floatAnim}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute flex flex-col gap-10 z-10 left-[calc(50%-450px)] top-1/2 -translate-y-1/2"
      >
        <img src={leftImage1} className="w-36 h-36 opacity-80" alt="left1" />
        <img src={leftImage2} className="w-40 h-40 opacity-80" alt="left2" />
      </motion.div>

      {/* Right floating images */}
      <motion.div
        animate={floatAnim}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        className="absolute flex flex-col gap-10 z-10 right-[calc(50%-450px)] top-1/2 -translate-y-1/2"
      >
        <img src={rightImage1} className="w-36 h-36 opacity-80" alt="right1" />
        <img src={rightImage2} className="w-40 h-40 opacity-80" alt="right2" />
      </motion.div>

      {/* Centered Professional Glass Card */}
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-20 backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl shadow-lg w-full max-w-md p-8"
      >
        <div className="text-center mb-6">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="flex justify-center mb-3"
          >
            <HiOutlineLockClosed className="text-blue-400" size={40} />
          </motion.div>
          <h2 className="text-2xl font-semibold text-white mb-1">Reset Password</h2>
          <p className="text-blue-200 text-sm">Enter your details to reset your password securely</p>
        </div>

        {message && (
          <div className="text-green-400 bg-green-900/20 border border-green-600/20 rounded-md px-4 py-2 text-sm mb-4 text-center">
            {message}
          </div>
        )}
        {error && (
          <div className="text-red-400 bg-red-900/20 border border-red-600/20 rounded-md px-4 py-2 text-sm mb-4 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email */}
          <div>
            <label className="block text-blue-100 text-sm mb-1">Email</label>
            <div className="relative">
              <HiOutlineMail className="absolute top-3 left-3 text-blue-200" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-3 py-2 rounded-lg bg-white/20 border border-white/30 text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                placeholder="Enter your email"
                required
              />
            </div>
          </div>

          {/* New Password */}
          <div>
            <label className="block text-blue-100 text-sm mb-1">New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-white/20 border border-white/30 text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
              placeholder="Enter new password"
              required
            />
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-blue-100 text-sm mb-1">Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-white/20 border border-white/30 text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
              placeholder="Confirm new password"
              required
            />
          </div>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            type="submit"
            className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2.5 rounded-lg font-medium shadow-md transition-all duration-200"
            disabled={loading}
          >
            {loading ? "Updating..." : "Update Password"}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;
