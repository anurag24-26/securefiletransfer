import React from "react";
import Logo from "../assets/logo.jpg";
import { motion } from "framer-motion";
import { HiCheckCircle } from "react-icons/hi";

const About = () => {
    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-100 to-gray-200 text-gray-800">

            {/* HERO SECTION */}
            <section className="text-center px-4 sm:px-6 md:px-12 pt-10 sm:pt-12 md:pt-16 pb-10">
                
                {/* Floating Logo */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.7 }}
                    className="flex justify-center"
                >
                    <motion.img
                        src={Logo}
                        alt="Crypterra Logo"
                        className="w-24 h-24 sm:w-28 sm:h-28 md:w-36 md:h-36 rounded-2xl shadow-xl ring-4 ring-white/70 object-cover"
                        animate={{ y: [0, -10, 0] }}
                        transition={{ duration: 4, repeat: Infinity }}
                    />
                </motion.div>

                {/* Orbitron Title */}
                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-3xl sm:text-4xl md:text-5xl font-bold mt-4 sm:mt-6"
                    style={{ fontFamily: "Orbitron, sans-serif" }}
                >
                    Crypterra
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-gray-600 mt-3 text-xs sm:text-sm md:text-lg max-w-xl mx-auto px-2"
                >
                    Secure cloud storage with encryption, access control, version tracking,
                    and full transparency.
                </motion.p>
            </section>

            {/* CONTENT CARD */}
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="max-w-3xl mx-auto bg-white/85 backdrop-blur-lg p-4 sm:p-6 md:p-10 rounded-2xl shadow-xl border border-white/50 mx-3"
            >
                {/* INTRO */}
                <p className="text-gray-700 leading-relaxed mb-3 text-sm sm:text-base">
                    Crypterra is a secure cloud storage platform built with advanced encryption
                    and <span className="font-semibold">multi-level access control</span>. It allows users to store,
                    collaborate, and share while ensuring total privacy.
                </p>

                <p className="text-gray-700 leading-relaxed mb-6 text-sm sm:text-base">
                    Designed for institutions, researchers, and organizations, Crypterra ensures
                    transparency, protected access, and complete activity tracking.
                </p>

                {/* FEATURES */}
                <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-4">
                    Key Features
                </h2>

                <ul className="space-y-3 mb-8 sm:mb-10">
                    {[
                        "End-to-end encryption for full data protection",
                        "Role-based access control (RBAC)",
                        "Activity logs & version tracking",
                        "Fast and scalable cloud backend",
                        "Clean & modern user interface",
                    ].map((item, index) => (
                        <motion.li
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="flex items-center gap-2 sm:gap-3 text-gray-700 text-sm sm:text-base"
                        >
                            <HiCheckCircle className="text-green-600 text-lg sm:text-xl" />
                            <span>{item}</span>
                        </motion.li>
                    ))}
                </ul>

                {/* MISSION */}
                <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-3 sm:mb-4">
                    Our Mission
                </h2>
                <p className="text-gray-700 leading-relaxed mb-6 text-sm sm:text-base">
                    Our mission is to make cloud collaboration secure, transparent, and effortless.
                    Crypterra gives users complete control over their data in a world filled with rising
                    digital threats.
                </p>

                <p className="text-gray-500 text-center text-xs sm:text-sm mt-4">
                    Thank you for choosing Crypterra — your data, secured the right way.
                </p>
            </motion.div>

            <div className="h-10"></div>
        </div>
    );
};

export default About;
