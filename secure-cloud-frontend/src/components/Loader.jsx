import React from "react";
import { motion } from "framer-motion";
import logo from "../assets/logo.jpg";

const Loader = () => {
  const float = {
    opacity: [0.3, 0.6, 0.3],
    scale: [1, 1.15, 1],
    x: [0, 15, -15],
    y: [0, -15, 15],
  };

  const particles = Array.from({ length: 25 });

  return (
    <div className="relative flex flex-col items-center justify-center h-screen w-full overflow-hidden bg-gradient-to-br from-[#0b0f1d] via-[#111933] to-[#080a14]">

      {/* Subtle Nebula Background */}
      <motion.div
        animate={{ ...float, rotate: [0, 8, -8, 0] }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        className="absolute w-[30rem] h-[30rem] bg-gradient-to-tr from-indigo-500/25 via-purple-500/10 to-transparent rounded-full blur-3xl"
      />
      <motion.div
        animate={{ ...float, rotate: [-8, 8, -8] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        className="absolute w-[36rem] h-[36rem] bg-gradient-to-tr from-blue-700/20 via-cyan-400/5 to-transparent rounded-full blur-3xl"
      />

      {/* Floating Particles */}
      {particles.map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1.5 h-1.5 bg-cyan-300 rounded-full shadow-[0_0_8px_2px_rgba(59,130,246,0.7)]"
          initial={{
            x: Math.random() * window.innerWidth - window.innerWidth / 2,
            y: Math.random() * window.innerHeight - window.innerHeight / 2,
            opacity: 0,
          }}
          animate={{
            y: ["100%", "-100%"],
            opacity: [0, 0.8, 0],
          }}
          transition={{
            duration: 6 + Math.random() * 5,
            repeat: Infinity,
            delay: Math.random() * 2,
            ease: "easeInOut",
          }}
        />
      ))}

      {/* Logo with elegant neon ring */}
      <div className="relative w-44 h-44 flex items-center justify-center mt-10">
        {/* Neon Ring */}
        <motion.div
          className="absolute w-full h-full rounded-full border-[3px] border-t-indigo-400 border-b-purple-400 opacity-40"
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 12, ease: "linear" }}
        />
        {/* Logo */}
        <motion.img
          src={logo}
          alt="Logo"
          className="w-20 h-20 rounded-full shadow-[0_0_35px_6px_rgba(99,102,241,0.6)]"
          
          transition={{ repeat: Infinity, duration: 6, ease: "linear" }}
        />
      </div>

      {/* App Name in White */}
      <motion.h1
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.5 }}
        className="mt-10 text-5xl md:text-6xl font-extrabold text-white drop-shadow-[0_0_25px_rgba(255,255,255,0.7)]"
        style={{ fontFamily: "Orbitron, sans-serif" }}
      >
        Crypteraa
      </motion.h1>

      {/* Tagline */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5, delay: 0.5 }}
        className="text-slate-300 mt-3 text-sm md:text-base tracking-widest uppercase drop-shadow-md"
      >
        Securing your cloud...
      </motion.p>
    </div>
  );
};

export default Loader;
