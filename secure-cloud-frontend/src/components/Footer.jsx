// Footer.js
import React from "react";
import { Link } from "react-router-dom";
import { FaGithub, FaTwitter, FaLinkedin } from "react-icons/fa";
import Logo from "../assets/logo.jpg";

const Footer = () => {
  return (
    <footer className="relative z-10 w-full bg-white border-t border-gray-200">
      <div className="mx-auto max-w-6xl px-6 py-6 md:py-8">
        {/* Top area: Brand + Links */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 md:gap-0">
          
          {/* Brand section */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 shadow-sm overflow-hidden">
              <img className="w-full h-full object-cover" src={Logo} alt="Crypterra Logo" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">Crypterra</h2>
              <p className="mt-1 text-gray-500 text-xs md:text-sm max-w-xs">
                Secure cloud storage with encryption & advanced access control.
              </p>
            </div>
          </div>

          {/* Quick Links */}
          <nav className="flex flex-col md:items-end gap-1 text-gray-600 mt-4 md:mt-0">
            <h3 className="text-gray-800 font-semibold text-sm mb-1">Quick Links</h3>
            <div className="flex flex-wrap justify-start md:justify-end gap-3 text-sm">
              <Link to="/about" className="hover:text-blue-500 transition-colors duration-200 font-medium">
                About
              </Link>
              <Link to="/privacy" className="hover:text-blue-500 transition-colors duration-200 font-medium">
                Privacy
              </Link>
              <Link to="/terms" className="hover:text-blue-500 transition-colors duration-200 font-medium">
                Terms
              </Link>
            </div>
          </nav>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-200 my-4 md:my-6" />

        {/* Bottom area */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-2 md:gap-0 text-sm text-gray-500">
          <p className="text-center md:text-left">
            © {new Date().getFullYear()} Crypterra. All rights reserved.
          </p>

          {/* Social icons */}
          <div className="flex gap-4 mt-2 md:mt-0">
            {[{ icon: FaGithub, link: "https://github.com" },
              { icon: FaTwitter, link: "https://twitter.com" },
              { icon: FaLinkedin, link: "https://linkedin.com" }].map((item, index) => {
                const Icon = item.icon;
                return (
                  <a
                    key={index}
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-blue-500 transition transform hover:scale-110"
                  >
                    <Icon size={18} />
                  </a>
                );
              })}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
