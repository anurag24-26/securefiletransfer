import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HiOutlineLockClosed, HiOutlineMail, HiCheckCircle } from "react-icons/hi";
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
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [successAnim, setSuccessAnim] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
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
      await api.post("/auth/forgot-password", {
        email,
        newPassword,
        confirmPassword,
      });

      setSuccessAnim(true);
      setTimeout(() => {
        setEmail("");
        setNewPassword("");
        setConfirmPassword("");
        setSuccessAnim(false);
      }, 4000);
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const floatAnim = { y: [0, -15, 0, 15, 0] };

  return (
    <div
      className="relative min-h-screen flex items-center justify-center overflow-hidden px-4 sm:px-6 py-8"
      style={{
        backgroundImage: `url(${bgImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* LEFT FLOATING IMAGES (Hidden on mobile) */}
      <motion.div
        animate={floatAnim}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="absolute flex-col gap-6 z-10 left-6 top-1/2 -translate-y-1/2 hidden lg:flex opacity-80"
      >
        <img src={leftImage1} className="w-24 h-24 xl:w-32 xl:h-32" alt="left1" />
        <img src={leftImage2} className="w-28 h-28 xl:w-40 xl:h-40" alt="left2" />
      </motion.div>

      {/* RIGHT FLOATING IMAGES (Hidden on mobile) */}
      <div className="absolute flex-col gap-6 z-10 right-6 top-1/2 -translate-y-1/2 hidden lg:flex opacity-80">
        <motion.img
          src={rightImage1}
          className="w-24 h-24 xl:w-32 xl:h-32"
          alt="right1"
          animate={floatAnim}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <AnimatePresence mode="wait">
        {!successAnim && (
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.6 }}
            className="relative z-20 w-full max-w-md sm:max-w-xl md:max-w-3xl p-6 sm:p-8 md:p-10
                       rounded-3xl border border-white/20 shadow-[0_8px_40px_rgba(0,0,0,0.4)]
                       bg-gradient-to-br from-white/15 via-white/10 to-white/5
                       backdrop-blur-xl flex flex-col md:flex-row items-center gap-8 sm:gap-10"
          >
            {/* LEFT IMAGE (Hidden on very small screens) */}
            <motion.div
              initial={{ opacity: 0, x: -25 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="hidden sm:flex justify-center md:w-1/2"
            >
              <img
                src={leftImageMain}
                alt="Forgot Password Illustration"
                className="w-48 sm:w-56 md:w-72 lg:w-80 drop-shadow-lg"
              />
            </motion.div>

            {/* FORM SIDE */}
            <div className="md:w-1/2 w-full">
              {/* HEADER */}
              <div className="text-center mb-6 sm:mb-8">
                <div className="flex justify-center mb-4 sm:mb-5">
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    className="p-3 rounded-full bg-blue-500/25 border border-blue-400/40"
                  >
                    <HiOutlineLockClosed className="text-white" size={34} />
                  </motion.div>
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-wide drop-shadow">
                  Reset Password
                </h2>
                <p className="text-blue-100/90 text-xs sm:text-sm mt-1">
                  Securely update your account password
                </p>
              </div>

              {error && (
                <div className="text-red-300 bg-red-900/40 border border-red-500/40 rounded-md px-3 sm:px-4 py-2 text-xs sm:text-sm mb-4 text-center">
                  {error}
                </div>
              )}

              {/* FORM */}
              <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
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
                      className="w-full pl-10 pr-3 py-2.5 rounded-lg bg-white/20 border border-white/30
                                 text-white placeholder-blue-200 focus:outline-none focus:ring-2
                                 focus:ring-blue-400 focus:border-transparent transition-all duration-200 text-sm sm:text-base"
                      placeholder="Enter your registered email"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-blue-100 text-sm mb-1 font-medium">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg bg-white/20 border border-white/30 text-white
                               placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400
                               focus:border-transparent transition-all duration-200 text-sm sm:text-base"
                    placeholder="Enter new password"
                    required
                  />
                </div>

                <div>
                  <label className="block text-blue-100 text-sm mb-1 font-medium">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg bg-white/20 border border-white/30 text-white
                               placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400
                               focus:border-transparent transition-all duration-200 text-sm sm:text-base"
                    placeholder="Re-enter new password"
                    required
                  />
                </div>

                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700
                             hover:from-blue-500 hover:via-indigo-500 hover:to-purple-600
                             text-white py-2.5 rounded-lg font-semibold shadow-md
                             transition-all duration-200 text-sm sm:text-base"
                  disabled={loading}
                >
                  {loading ? "Updating..." : "Update Password"}
                </motion.button>
              </form>
            </div>
          </motion.div>
        )}

        {/* SUCCESS ANIMATION */}
        {successAnim && (
          <motion.div
            key="success"
            className="absolute inset-0 flex flex-col items-center justify-center z-40 text-center px-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
          >
            <motion.img
              src={rightImage2}
              alt="success"
              initial={{ y: 100, scale: 0.8 }}
              animate={{ y: 0, scale: 1.2 }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              className="w-40 h-40 sm:w-52 sm:h-52 md:w-64 md:h-64 mb-4"
            />
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              <HiCheckCircle
                className="text-green-400 mx-auto mb-2 drop-shadow-lg"
                size={42}
              />
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-green-300 drop-shadow">
                Password Changed Successfully!
              </h2>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ForgotPassword;
