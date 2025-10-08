import React from "react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="relative z-10 w-full border-t border-white/10 bg-slate-900/80 backdrop-blur-md">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Top area */}
        <div className="py-6 sm:py-8 grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8 text-gray-300 text-sm">
          {/* Brand */}
          <div className="text-center sm:text-left">
            <h2 className="text-lg font-semibold text-white">Crypterra</h2>
            <p className="mt-2 text-gray-400">
              Secure cloud storage with encryption & access control.
            </p>
          </div>

          {/* Quick Links */}
          <nav className="flex flex-col sm:items-end gap-2 sm:gap-1 text-center sm:text-right">
            <h3 className="text-white/90 font-medium">Quick Links</h3>
            <div className="flex flex-wrap justify-center sm:justify-end gap-x-4 gap-y-2">
              <Link to="/about" className="hover:text-cyan-300 transition">About</Link>
              <Link to="/privacy" className="hover:text-cyan-300 transition">Privacy</Link>
              <Link to="/terms" className="hover:text-cyan-300 transition">Terms</Link>
            </div>
          </nav>
        </div>

        {/* Bottom line */}
        <div className="border-t border-white/10 py-4 text-center text-xs text-gray-400">
          © {new Date().getFullYear()} Crypterra. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
