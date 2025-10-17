// Navbar.jsx — with smooth mobile animation and refined responsiveness
import React, { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import logo from "../assets/logo.jpg";

const Navbar = () => {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const commonLinks = [
    { to: "/", label: "Home" },
    { to: "/myOrganization", label: "My Organization" },
    { to: "/yourfiles", label: "Your Files" },
  ];

  const authLinks = [{ to: "/login", label: "Login/Signup" }];

  const userLinks = [];
  if (user && ["superAdmin", "orgAdmin", "deptAdmin"].includes(user.role)) {
    userLinks.push(
      { to: "/adminSettings", label: "Admin Settings" },
      { to: "/orglist", label: "Organizations" }
    );
  }

  const activeClass =
    "relative text-indigo-500 font-semibold after:content-[''] after:absolute after:w-full after:h-[2px] after:bg-gradient-to-r after:from-indigo-400 after:to-blue-400 after:bottom-[-4px] after:left-0 drop-shadow-[0_0_8px_rgba(99,102,241,0.7)] transition-all duration-300";

  return (
    <nav className="fixed top-0 w-full bg-white/30 backdrop-blur-xl shadow-lg border-b border-indigo-200/30 z-50 font-[Poppins]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo & Brand */}
          <Link
            to="/"
            className="flex items-center space-x-3 hover:scale-105 transition-transform duration-300"
          >
            <img
              src={logo}
              alt="Crypterra Logo"
              className="h-10 w-10 rounded-full border border-indigo-400 shadow-[0_0_12px_rgba(99,102,241,0.5)]"
            />
            <span className="text-2xl font-extrabold tracking-wide text-indigo-700 drop-shadow-[0_0_12px_rgba(99,102,241,0.7)] hover:drop-shadow-[0_0_20px_rgba(99,102,241,0.9)] transition-all duration-300 font-[Orbitron]">
              Crypterra
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex space-x-8 items-center">
            {[...commonLinks, ...(token ? userLinks : authLinks)].map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  "relative inline-flex items-center px-1 pt-1 text-[15px] font-medium tracking-wide transition-all duration-300 " +
                  (isActive
                    ? activeClass
                    : "text-gray-600 hover:text-indigo-500 after:content-[''] after:absolute after:w-0 after:h-[2px] after:bg-gradient-to-r after:from-indigo-400 after:to-blue-400 after:bottom-[-4px] after:left-0 hover:after:w-full after:transition-all after:duration-300")
                }
              >
                {link.label}
              </NavLink>
            ))}

            {token && (
              <button
                onClick={handleLogout}
                className="ml-4 bg-gradient-to-r from-indigo-500 to-blue-500 text-white px-5 py-2 rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                Logout
              </button>
            )}
          </div>

          {/* Mobile Hamburger */}
          <div className="md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-600 hover:text-indigo-500 hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all duration-300"
            >
              {mobileMenuOpen ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Smooth Animated Mobile Dropdown */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            key="mobile-menu"
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="md:hidden bg-white/40 backdrop-blur-lg shadow-inner border-t border-indigo-200/30"
          >
            <div className="pt-2 pb-3 space-y-1">
              {[...commonLinks, ...(token ? userLinks : authLinks)].map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) =>
                    "block pl-4 pr-4 py-2 border-l-4 text-base font-medium tracking-wide transition-all duration-200 " +
                    (isActive
                      ? "bg-white/30 border-indigo-400 text-indigo-600 shadow-[inset_0_0_12px_rgba(99,102,241,0.3)]"
                      : "border-transparent text-gray-600 hover:border-indigo-400 hover:bg-white/20 hover:text-indigo-500")
                  }
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </NavLink>
              ))}

              {token && (
                <button
                  onClick={handleLogout}
                  className="w-[90%] mx-auto block mt-3 text-center bg-gradient-to-r from-indigo-500 to-blue-500 text-white py-2 rounded-2xl font-semibold hover:shadow-xl transition-all duration-300 hover:scale-105"
                >
                  Logout
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
