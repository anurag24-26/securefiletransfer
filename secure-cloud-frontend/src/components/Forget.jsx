import React, { useState } from "react";
import { motion } from "framer-motion";
import { HiOutlineLockClosed, HiOutlineMail } from "react-icons/hi";
import api from "../services/api";

// Local images
import bgImage from "../assets/back1.jpg";
import sideImage from "../assets/forgotpass.svg";
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
      const res = await api.post("/auth/forgot-password", {
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

  const floatAnim = { y: [0, -10, 0, 10, 0] };

  return (
    <div
      className="relative min-h-screen flex items-center justify-center overflow-hidden px-4"
      style={{
        backgroundImage: `url(${bgImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Floating decorations */}
      <motion.div
        animate={floatAnim}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute flex flex-col gap-8 z-10 left-6 md:left-[calc(50%-450px)] top-1/2 -translate-y-1/2 hidden md:flex"
      >
        <img src={leftImage1} className="w-36 h-36 opacity-70" alt="left1" />
        <img src={leftImage2} className="w-40 h-40 opacity-70" alt="left2" />
      </motion.div>

      <motion.div
        animate={floatAnim}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2,
        }}
        className="absolute flex flex-col gap-8 z-10 right-6 md:right-[calc(50%-450px)] top-1/2 -translate-y-1/2 hidden md:flex"
      >
        <img src={rightImage1} className="w-36 h-36 opacity-70" alt="right1" />
        <img src={rightImage2} className="w-44 h-44 opacity-70" alt="right2" />
      </motion.div>

      {/* Main glassmorphic card */}
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-20 flex flex-col md:flex-row items-center 
                   w-full max-w-3xl rounded-3xl shadow-2xl
                   bg-gradient-to-br from-white/25 via-white/15 to-transparent 
                   backdrop-blur-2xl border border-white/20 overflow-hidden"
      >
        {/* Left illustration */}
        <motion.div
          className="hidden md:flex w-1/2 h-full items-center justify-center 
                     bg-gradient-to-b from-blue-500/10 to-blue-800/10 p-6"
          animate={floatAnim}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        >
          <img
            src={sideImage}
            alt="Forgot Password Illustration"
            className="object-contain max-h-72 drop-shadow-[0_0_20px_rgba(59,130,246,0.4)]"
          />
        </motion.div>

        {/* Form Section */}
        <div className="w-full md:w-1/2 p-8">
          <div className="text-center mb-6">
            <motion.div
              initial={{ rotate: -10, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              transition={{ duration: 0.6 }}
              className="flex justify-center mb-3"
            >
              <div className="p-3 rounded-full bg-gradient-to-tr from-blue-500/30 to-cyan-400/30 backdrop-blur-md border border-blue-300/40 shadow-inner">
                <HiOutlineLockClosed className="text-blue-300" size={38} />
              </div>
            </motion.div>

            <h2 className="text-2xl font-semibold text-white mb-1 tracking-wide drop-shadow-lg">
              Reset Password
            </h2>
            <p className="text-blue-200/90 text-sm">
              Enter your details to reset your password securely
            </p>
          </div>

          {/* Alerts */}
          {message && (
            <div className="text-green-300 bg-green-900/30 border border-green-500/30 rounded-md px-4 py-2 text-sm mb-4 text-center shadow-md">
              {message}
            </div>
          )}
          {error && (
            <div className="text-red-300 bg-red-900/30 border border-red-500/30 rounded-md px-4 py-2 text-sm mb-4 text-center shadow-md">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
            {/* Email */}
            <div>
              <label className="block text-blue-100 text-sm mb-1">Email</label>
              <div className="relative">
                <HiOutlineMail className="absolute top-3 left-3 text-blue-200" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 rounded-lg 
                             bg-white/20 border border-white/30 text-white 
                             placeholder-blue-200 focus:outline-none focus:ring-2 
                             focus:ring-blue-400/60 focus:border-blue-300 transition"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            {/* New Password */}
            <div>
              <label className="block text-blue-100 text-sm mb-1">
                New Password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg 
                           bg-white/20 border border-white/30 text-white 
                           placeholder-blue-200 focus:outline-none focus:ring-2 
                           focus:ring-blue-400/60 focus:border-blue-300 transition"
                placeholder="Enter new password"
                required
              />
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-blue-100 text-sm mb-1">
                Confirm Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg 
                           bg-white/20 border border-white/30 text-white 
                           placeholder-blue-200 focus:outline-none focus:ring-2 
                           focus:ring-blue-400/60 focus:border-blue-300 transition"
                placeholder="Confirm new password"
                required
              />
            </div>

            {/* Button */}
            <motion.button
              whileHover={{ scale: 1.04, boxShadow: "0px 0px 15px rgba(59,130,246,0.4)" }}
              whileTap={{ scale: 0.96 }}
              type="submit"
              className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 
                         hover:from-blue-600 hover:to-indigo-700 
                         text-white py-2.5 rounded-lg font-semibold 
                         shadow-md transition-all duration-300"
              disabled={loading}
            >
              {loading ? "Updating..." : "Update Password"}
            </motion.button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;
