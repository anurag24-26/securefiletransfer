import React from "react";
import { motion } from "framer-motion";
import logo from "../assets/logo.jpg"; // Replace with your logo

const Loader = () => {
  return (
    <div className="relative flex flex-col items-center justify-center h-screen w-full overflow-hidden bg-gradient-to-br from-[#0f172a] via-[#1e1b4b] to-[#0f172a]">

      {/* Animated background orbs */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{
          opacity: [0.3, 0.6, 0.3],
          scale: [1, 1.2, 1],
          x: [0, 20, -20],
          y: [0, -20, 20],
        }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="absolute w-72 h-72 bg-indigo-500/20 rounded-full blur-3xl"
      />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{
          opacity: [0.2, 0.4, 0.2],
          scale: [1, 1.3, 1],
          x: [0, -30, 30],
          y: [0, 30, -30],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute w-96 h-96 bg-blue-700/10 rounded-full blur-3xl"
      />

      {/* Spinning glowing ring */}
      <motion.div
        className="relative w-28 h-28 flex items-center justify-center"
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
      >
        <div className="absolute inset-0 rounded-full border-t-4 border-b-4 border-transparent border-t-indigo-500 border-b-purple-500 blur-sm" />
        <div className="absolute inset-0 rounded-full border-t-4 border-b-4 border-transparent border-t-indigo-400 border-b-blue-400 opacity-70 animate-pulse" />

        {/* Logo spinning inside the ring */}
        <motion.img
          src={logo}
          alt="Logo"
          className="w-14 h-14 rounded-full shadow-lg"
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
        />
      </motion.div>

      {/* App Name in Orbitron font */}
      <motion.h1
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: [0, 1, 0.8, 1], y: 0 }}
        transition={{ duration: 1.5, repeat: Infinity, repeatType: "mirror" }}
        className="mt-6 text-4xl font-bold text-white drop-shadow-lg"
        style={{ fontFamily: "Orbitron, sans-serif" }}
      >
        Crypteraa
      </motion.h1>

      {/* Tagline */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: [0.4, 1, 0.4] }}
        transition={{ duration: 2.5, repeat: Infinity }}
        className="text-slate-400 mt-2 text-sm tracking-wide"
      >
        Securing your cloud...
      </motion.p>
    </div>
  );
};

export default Loader;
