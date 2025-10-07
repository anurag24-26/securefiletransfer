import React, { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import logo from "../assets/logo.jpg";

const Navbar = () => {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const activeClass =
    "relative text-cyan-400 font-semibold after:content-[''] after:absolute after:w-full after:h-[2px] after:bg-gradient-to-r after:from-cyan-400 after:to-purple-400 after:bottom-[-5px] after:left-0 drop-shadow-[0_0_10px_rgba(34,211,238,0.7)] transition-all duration-300";

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const commonLinks = [
    { to: "/", label: "Home" },
    { to: "/myOrganization", label: "My Organization" },
    { to: "/filelist", label: "Files" },
  ];

  const authLinks = [
    { to: "/login", label: "Login" },
    { to: "/signup", label: "Sign Up" },
  ];

  const userLinks = [];

  if (user && ["superAdmin", "orgAdmin", "deptAdmin"].includes(user.role)) {
    userLinks.push(
      { to: "/adminSettings", label: "Admin Settings" },
      { to: "/orglist", label: "Organizations" }
    );
  }

  return (
    <nav className="fixed top-0 w-full bg-gradient-to-r from-[#050A1F]/95 via-[#0A122C]/95 to-[#141A32]/95 backdrop-blur-lg shadow-[0_2px_15px_rgba(0,0,0,0.6)] border-b border-cyan-500/20 z-50 font-[Poppins]">
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
              className="h-10 w-10 rounded-full border border-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.5)]"
            />
            <span
              className="text-2xl font-extrabold tracking-wide text-white drop-shadow-[0_0_12px_rgba(255,255,255,0.8)] hover:drop-shadow-[0_0_20px_rgba(34,211,238,0.8)] transition-all duration-300 font-[Orbitron]"
            >
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
                    : "text-gray-300 hover:text-cyan-400 after:content-[''] after:absolute after:w-0 after:h-[2px] after:bg-gradient-to-r after:from-cyan-400 after:to-purple-400 after:bottom-[-5px] after:left-0 hover:after:w-full after:transition-all after:duration-300")
                }
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </NavLink>
            ))}

            {/* Logout Button */}
            {token && (
              <button
                onClick={handleLogout}
                className="ml-4 bg-gradient-to-r from-red-500 via-pink-600 to-purple-600 text-white px-5 py-2 rounded-full font-semibold tracking-wide shadow-[0_0_15px_rgba(59,130,246,0.5)] hover:shadow-[0_0_20px_rgba(59,130,246,0.8)] transition-all duration-300 hover:scale-105"
              >
                Logout
              </button>
            )}
          </div>

          {/* Mobile Hamburger */}
          <div className="md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-300 hover:text-cyan-400 hover:bg-[#1a2035]/70 focus:outline-none focus:ring-2 focus:ring-cyan-400"
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
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
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
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-gradient-to-b from-[#0f172a]/95 via-[#111827]/95 to-[#020617]/95 backdrop-blur-md shadow-inner border-t border-cyan-400/20">
          <div className="pt-2 pb-3 space-y-1">
            {[...commonLinks, ...(token ? userLinks : authLinks)].map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  "block pl-4 pr-4 py-2 border-l-4 text-base font-medium tracking-wide transition-all duration-200 " +
                  (isActive
                    ? "bg-[#1e293b]/80 border-cyan-400 text-cyan-400 shadow-[inset_0_0_12px_rgba(34,211,238,0.3)]"
                    : "border-transparent text-gray-300 hover:border-cyan-400 hover:bg-[#1e293b]/70 hover:text-cyan-300")
                }
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </NavLink>
            ))}

            {token && (
              <button
                onClick={handleLogout}
                className="w-[90%] mx-auto block mt-3 text-center bg-gradient-to-r from-red-500 via-pink-600 to-purple-600 text-white py-2 rounded-full font-semibold hover:shadow-[0_0_15px_rgba(59,130,246,0.8)] transition-all duration-300 hover:scale-105"
              >
                Logout
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
