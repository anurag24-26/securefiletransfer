import React from "react";
import Logo from "../assets/logo.jpg";

const About = () => {
    return (
        <div className="min-h-screen bg-gray-50 px-6 py-10 md:px-12">
            <div className="max-w-4xl mx-auto bg-white p-6 md:p-10 rounded-xl shadow-sm border border-gray-200">

                {/* Header Section */}
                <div className="flex items-center gap-4 mb-6">
                    <img src={Logo} alt="Crypterra Logo" className="w-14 h-14 rounded-full shadow-sm" />
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">About Crypterra</h1>
                        <p className="text-gray-500 text-sm">Secure Cloud Storage with Encryption & Access Control</p>
                    </div>
                </div>

                {/* Content */}
                <p className="text-gray-700 leading-relaxed mb-4">
                    Crypterra is a secure cloud storage platform designed to protect sensitive data using
                    <span className="font-semibold"> advanced encryption techniques</span> and
                    <span className="font-semibold"> multi-level access control</span>. Our goal is to provide a safe and reliable
                    environment where users can store, share, and collaborate without compromising privacy.
                </p>

                <p className="text-gray-700 leading-relaxed mb-4">
                    Built for academic institutions, researchers, and organizations, Crypterra ensures that
                    only authorized users can access files, while every activity is tracked through transparent
                    audit logs and version history.
                </p>

                {/* Features Section */}
                <h2 className="text-xl font-semibold text-gray-800 mb-3">Key Features</h2>
                <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-6">
                    <li>End-to-end encryption for secure data protection</li>
                    <li>Role-based access control (RBAC)</li>
                    <li>Version tracking & activity logs</li>
                    <li>Fast and reliable cloud backend</li>
                    <li>User-friendly interface for smooth collaboration</li>
                </ul>

                {/* Mission Section */}
                <h2 className="text-xl font-semibold text-gray-800 mb-3">Our Mission</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                    Our mission is to make cloud collaboration secure, transparent, and trustworthy.
                    In a digital world where data breaches are increasing, Crypterra empowers users with
                    complete control over their information.
                </p>

                {/* Footer Note */}
                <p className="text-gray-500 text-sm mt-6">
                    Thank you for choosing Crypterra — your data, secured the right way.
                </p>

            </div>
        </div>
    );
};

export default About;
