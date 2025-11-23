import React from "react";
import Logo from "../assets/logo.jpg";
import { motion } from "framer-motion";
import { HiCheckCircle } from "react-icons/hi";

const About = () => {
    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-100 to-gray-200 px-4 py-8 md:px-10">

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-3xl mx-auto backdrop-blur-xl bg-white/70 p-6 md:p-10 rounded-2xl shadow-lg border border-white/40"
            >
                {/* Header */}
                <div className="flex items-center gap-4 mb-6">
                    <motion.img
                        src={Logo}
                        alt="Crypterra Logo"
                        className="w-16 h-16 rounded-full shadow-md ring-2 ring-white"
                        initial={{ scale: 0.9 }}
                        animate={{ scale: 1 }}
                    />

                    <div>
                        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">
                            About Crypterra
                        </h1>
                        <p className="text-gray-600 text-sm md:text-base">
                            Secure Cloud Storage • Encryption • Access Control
                        </p>
                    </div>
                </div>

                {/* Content */}
                <p className="text-gray-700 leading-relaxed mb-4 text-sm md:text-base">
                    Crypterra is a secure cloud storage platform designed to protect sensitive
                    data using <span className="font-semibold">advanced encryption techniques</span> and
                    <span className="font-semibold"> multi-level access control</span>. Our goal is to ensure
                    users can store, share, and collaborate without compromising privacy.
                </p>

                <p className="text-gray-700 leading-relaxed mb-6 text-sm md:text-base">
                    Built for academic institutions, researchers, and organizations — Crypterra ensures
                    only authorized users can access files. All activities are tracked with
                    transparent audit logs and version management.
                </p>

                {/* Features */}
                <h2 className="text-xl font-bold text-gray-900 mb-4">Key Features</h2>
                <ul className="space-y-3 mb-8">
                    {[
                        "End-to-end encryption for secure data protection",
                        "Role-based access control (RBAC)",
                        "Version tracking & activity logs",
                        "Fast and reliable cloud backend",
                        "User-friendly interface for smooth collaboration",
                    ].map((item, index) => (
                        <motion.li
                            key={index}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="flex items-center gap-2 text-gray-700"
                        >
                            <HiCheckCircle className="text-green-600 text-xl" />
                            <span className="text-sm md:text-base">{item}</span>
                        </motion.li>
                    ))}
                </ul>

                {/* Mission */}
                <h2 className="text-xl font-bold text-gray-900 mb-4">Our Mission</h2>
                <p className="text-gray-700 leading-relaxed mb-6 text-sm md:text-base">
                    Our mission is to make cloud collaboration secure, transparent, and 
                    trustworthy. In a digital world full of breaches, Crypterra gives users complete 
                    control over their information.
                </p>

                {/* Footer */}
                <p className="text-gray-500 text-xs md:text-sm text-center mt-6">
                    Thank you for choosing Crypterra — your data, secured the right way.
                </p>
            </motion.div>
        </div>
    );
};

export default About;
