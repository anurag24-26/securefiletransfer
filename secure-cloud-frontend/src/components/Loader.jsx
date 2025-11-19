import React from "react";
import { motion } from "framer-motion";
import logo from "../assets/logo.jpg";

const Loader = () => {
  const float = {
    opacity: [0.25, 0.5, 0.25],
    scale: [1, 1.08, 1],
    x: [0, 10, -10],
    y: [0, -10, 10],
  };

  const particles = Array.from({ length: 25 });

  return (
    <div className="relative flex flex-col items-center justify-center h-screen w-full overflow-hidden bg-gradient-to-b from-black to-[#111]">

      {/* Subtle Ambient Glow */}
      <motion.div
        animate={{ ...float, rotate: [0, 6, -6, 0] }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        className="absolute w-[28rem] h-[28rem] bg-gradient-to-tr from-white/10 via-white/5 to-transparent rounded-full blur-3xl"
      />
      <motion.div
        animate={{ ...float, rotate: [-6, 6, -6] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        className="absolute w-[34rem] h-[34rem] bg-gradient-to-tr from-white/5 via-white/2 to-transparent rounded-full blur-[90px]"
      />

      {/* Floating Particles */}
      {particles.map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1.5 h-1.5 bg-white rounded-full shadow-[0_0_6px_2px_rgba(255,255,255,0.5)]"
          initial={{
            x: Math.random() * window.innerWidth - window.innerWidth / 2,
            y: Math.random() * window.innerHeight - window.innerHeight / 2,
            opacity: 0,
          }}
          animate={{
            y: ["100%", "-100%"],
            opacity: [0, 0.7, 0],
          }}
          transition={{
            duration: 5 + Math.random() * 4,
            repeat: Infinity,
            delay: Math.random() * 2,
            ease: "easeInOut",
          }}
        />
      ))}

      {/* Logo with Premium Ring */}
      <div className="relative w-44 h-44 flex items-center justify-center mt-10">
        {/* Rotating Ring */}
        <motion.div
          className="absolute w-full h-full rounded-full border-[3px] border-t-white/60 border-b-white/20 opacity-40"
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 10, ease: "linear" }}
        />

        {/* Logo */}
        <motion.img
          src={logo}
          alt="Logo"
          className="w-20 h-20 rounded-full shadow-[0_0_30px_4px_rgba(255,255,255,0.35)]"
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.2 }}
        />
      </div>

      {/* App Name */}
      <motion.h1
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.4 }}
        className="mt-10 text-5xl md:text-6xl font-extrabold text-white tracking-widest"
        style={{ fontFamily: "Orbitron, sans-serif" }}
      >
        Crypteraa
      </motion.h1>

      {/* Tagline */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.6, delay: 0.3 }}
        className="text-gray-400 mt-3 text-sm md:text-base tracking-[0.35em] uppercase"
      >
        Securing your cloud...
      </motion.p>
    </div>
  );
};

export default Loader;
