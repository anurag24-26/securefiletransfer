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
      { to: "/orglist", label: "Organizations" },
       { to: "/logs", label: "Logs" }
    );
  }

  const activeClass =
    "text-gray-900 font-semibold border-b-2 border-gray-800";

  return (
    <nav className="fixed top-0 w-full bg-white shadow-[0_2px_10px_rgba(0,0,0,0.06)] border-b border-gray-200 z-50 font-[Inter]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <img
              src={logo}
              alt="Logo"
              className="h-10 w-10 rounded-full border border-gray-300"
            />
            <span className="text-xl font-bold text-gray-800 tracking-tight">
              Crypterra
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-8">
            {[...commonLinks, ...(token ? userLinks : authLinks)].map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  "relative text-[15px] font-medium transition-all pb-1 " +
                  (isActive
                    ? activeClass
                    : "text-gray-600 hover:text-black")
                }
              >
                {link.label}
              </NavLink>
            ))}

            {token && (
              <button
                onClick={handleLogout}
                className="ml-2 px-4 py-1.5 border border-gray-300 rounded-xl text-gray-800 text-sm font-medium hover:bg-gray-100 transition"
              >
                Logout
              </button>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-md hover:bg-gray-100 transition"
          >
            {mobileMenuOpen ? (
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="black">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="black">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.25 }}
            className="md:hidden bg-white border-t border-gray-200 shadow-inner"
          >
            <div className="py-3 space-y-1">
              {[...commonLinks, ...(token ? userLinks : authLinks)].map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    "block px-4 py-2 text-base transition " +
                    (isActive
                      ? "text-black font-semibold bg-gray-100"
                      : "text-gray-700 hover:bg-gray-100")
                  }
                >
                  {link.label}
                </NavLink>
              ))}

              {token && (
                <button
                  onClick={handleLogout}
                  className="w-[90%] mx-auto block mt-2 border border-gray-300 py-2 rounded-xl text-gray-800 font-medium hover:bg-gray-100 transition"
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
