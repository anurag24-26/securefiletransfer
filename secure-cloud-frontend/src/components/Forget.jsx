import React, { useState } from "react";
import { motion } from "framer-motion";
import { HiOutlineLockClosed, HiOutlineMail } from "react-icons/hi";
import api from "../services/api";

// Local images
import bgImage from "../assets/back1.jpg";
import leftImageMain from "../assets/forgotpass.svg";
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

  const floatAnim = { y: [0, -15, 0, 15, 0] };

  return (
    <div
      className="relative min-h-screen flex items-center justify-center overflow-hidden px-4"
      style={{
        backgroundImage: `url(${bgImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* FLOATING DECORATIVE IMAGES */}
      <motion.div
        animate={floatAnim}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="absolute flex flex-col gap-8 z-10 left-8 top-1/2 -translate-y-1/2 hidden md:flex opacity-80"
      >
        <img src={leftImage1} className="w-32 h-32" alt="left1" />
        <img src={leftImage2} className="w-40 h-40" alt="left2" />
      </motion.div>

      <motion.div
        animate={floatAnim}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2,
        }}
        className="absolute flex flex-col gap-8 z-10 right-8 top-1/2 -translate-y-1/2 hidden md:flex opacity-80"
      >
        <img src={rightImage1} className="w-32 h-32" alt="right1" />
        <img src={rightImage2} className="w-40 h-40" alt="right2" />
      </motion.div>

      {/* MAIN CARD */}
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="relative z-20 w-full max-w-3xl p-8 md:p-10 rounded-3xl
                   border border-white/20 shadow-[0_8px_40px_rgba(0,0,0,0.4)]
                   bg-gradient-to-br from-white/15 via-white/10 to-white/5
                   backdrop-blur-xl flex flex-col md:flex-row items-center gap-10"
      >
        {/* LEFT IMAGE */}
        <motion.div
          initial={{ opacity: 0, x: -25 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="flex justify-center md:w-1/2"
        >
          <img
            src={leftImageMain}
            alt="Forgot Password Illustration"
            className="w-64 md:w-80 drop-shadow-lg"
          />
        </motion.div>

        {/* FORM SIDE */}
        <div className="md:w-1/2 w-full">
          {/* HEADER */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-5">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="p-3 rounded-full bg-blue-500/25 border border-blue-400/40"
              >
                <HiOutlineLockClosed className="text-white" size={38} />
              </motion.div>
            </div>

            <h2 className="text-3xl font-bold text-white tracking-wide drop-shadow">
              Reset Password
            </h2>
            <p className="text-blue-100/90 text-sm mt-1">
              Securely update your account password
            </p>
          </div>

          {/* ALERTS */}
          {message && (
            <div className="text-green-300 bg-green-900/40 border border-green-500/40 rounded-md px-4 py-2 text-sm mb-4 text-center">
              {message}
            </div>
          )}
          {error && (
            <div className="text-red-300 bg-red-900/40 border border-red-500/40 rounded-md px-4 py-2 text-sm mb-4 text-center">
              {error}
            </div>
          )}

          {/* FORM */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-blue-100 text-sm mb-1 font-medium">
                Email Address
              </label>
              <div className="relative">
                <HiOutlineMail className="absolute top-3 left-3 text-blue-200" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 rounded-lg
                             bg-white/20 border border-white/30 text-white
                             placeholder-blue-200 focus:outline-none focus:ring-2
                             focus:ring-blue-400 focus:border-transparent
                             transition-all duration-200"
                  placeholder="Enter your registered email"
                  required
                />
              </div>
            </div>

            {/* New Password */}
            <div>
              <label className="block text-blue-100 text-sm mb-1 font-medium">
                New Password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg
                           bg-white/20 border border-white/30 text-white
                           placeholder-blue-200 focus:outline-none focus:ring-2
                           focus:ring-blue-400 focus:border-transparent
                           transition-all duration-200"
                placeholder="Enter new password"
                required
              />
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-blue-100 text-sm mb-1 font-medium">
                Confirm Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg
                           bg-white/20 border border-white/30 text-white
                           placeholder-blue-200 focus:outline-none focus:ring-2
                           focus:ring-blue-400 focus:border-transparent
                           transition-all duration-200"
                placeholder="Re-enter new password"
                required
              />
            </div>

            {/* Submit Button */}
            <motion.button
              whileHover={{ scale: 1.03, boxShadow: "0 0 18px rgba(59,130,246,0.4)" }}
              whileTap={{ scale: 0.97 }}
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700
                         hover:from-blue-500 hover:via-indigo-500 hover:to-purple-600
                         text-white py-2.5 rounded-lg font-semibold shadow-md
                         transition-all duration-200"
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
