import React from "react";
import { Link } from "react-router-dom";
import { FaGithub, FaTwitter, FaLinkedin } from "react-icons/fa";
import Logo from "../assets/logo.jpg"

const Footer = () => {
  return (
    <footer className="relative z-10 w-full bg-gradient-to-t from-slate-900/90 to-slate-900/70 backdrop-blur-lg border-t border-white/10">
      <div className="mx-auto max-w-6xl px-6 py-10">
        {/* Top area: Brand + Links */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 md:gap-4">
          
          {/* Brand + Doodle */}
          <div className="flex items-center gap-4">
            {/* Doodle / Icon */}
            <div className="w-12 h-12 flex items-center justify-center rounded-full shadow-lg">
              <span className="text-white font-bold text-xl">
<img className="rounded-full" src={Logo} alt="" />

              </span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Crypterra</h2>
              <p className="mt-1 text-gray-400 text-sm max-w-xs">
                Secure cloud storage with encryption & advanced access control.
              </p>
            </div>
          </div>

          {/* Quick Links */}
          <nav className="flex flex-col md:items-end gap-4 text-gray-300">
            <h3 className="text-white/90 font-semibold text-lg mb-2">Quick Links</h3>
            <div className="flex flex-wrap justify-start md:justify-end gap-4">
              <Link to="/about" className="hover:text-cyan-400 transition-colors duration-200">
                About
              </Link>
              <Link to="/privacy" className="hover:text-cyan-400 transition-colors duration-200">
                Privacy
              </Link>
              <Link to="/terms" className="hover:text-cyan-400 transition-colors duration-200">
                Terms
              </Link>
            </div>
          </nav>
        </div>

        {/* Divider */}
        <div className="border-t border-white/10 my-6" />

        {/* Bottom area: Social + Copyright */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-400 text-xs md:text-sm text-center md:text-left">
            © {new Date().getFullYear()} Crypterra. All rights reserved.
          </p>
          
          {/* Social icons with hover glow */}
          <div className="flex gap-4 text-gray-400">
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-cyan-400 transition duration-200 hover:scale-110"
            >
              <FaGithub size={20} />
            </a>
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-cyan-400 transition duration-200 hover:scale-110"
            >
              <FaTwitter size={20} />
            </a>
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-cyan-400 transition duration-200 hover:scale-110"
            >
              <FaLinkedin size={20} />
            </a>
          </div>
        </div>
      </div>

      {/* Neon glow bottom accent */}
      <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 opacity-50 animate-pulse"></div>
    </footer>
  );
};

export default Footer;
