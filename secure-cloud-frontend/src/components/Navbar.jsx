import React, { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { motion, AnimatePresence } from "framer-motion";

// REACT ICONS IMPORTS
import {
  FaHome,
  FaBuilding,
  FaRegFolder,
  FaCog,
  FaSearch,
  FaUserCircle,
  FaSignOutAlt,
} from "react-icons/fa";

import logo from "../assets/logo.jpg";

const Navbar = () => {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenu, setMobileMenu] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // NAV CONFIG
  const commonLinks = [
    { to: "/", label: "Home", icon: <FaHome className="h-6 w-6" /> },
    {
      to: "/myOrganization",
      label: "My Organization",
      icon: <FaBuilding className="h-6 w-6" />,
    },
    {
      to: "/yourfiles",
      label: "Your Files",
      icon: <FaRegFolder className="h-6 w-6" />,
    },
  ];

  const adminLinks =
    user && ["superAdmin", "orgAdmin", "deptAdmin"].includes(user.role)
      ? [
          {
            to: "/adminSettings",
            label: "Admin Settings",
            icon: <FaCog className="h-6 w-6" />,
          },
          {
            to: "/orglist",
            label: "Organizations",
            icon: <FaBuilding className="h-6 w-6" />,
          },
          {
            to: "/logs",
            label: "Logs",
            icon: <FaSearch className="h-6 w-6" />,
          },
        ]
      : [];

  const authLinks = [
    {
      to: "/login",
      label: "Login / Signup",
      icon: <FaUserCircle className="h-6 w-6" />,
    },
  ];

  const navItems = [...commonLinks, ...(token ? adminLinks : authLinks)];

  return (
    <nav className="fixed top-0 w-full bg-white border-b shadow-sm z-50 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 flex justify-between items-center h-16">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-3">
          <img src={logo} className="h-10 w-10 rounded-full border" />
          <span className="text-xl font-bold text-gray-800">Crypterra</span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-6">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                "relative group flex items-center justify-center p-2 rounded-lg transition-all " +
                (isActive
                  ? "bg-gray-100 text-black"
                  : "text-gray-600 hover:bg-gray-50 hover:text-black")
              }
            >
              {item.icon}

              {/* Tooltip */}
              <AnimatePresence>
                <motion.span
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 5 }}
                  className="absolute bottom-[-28px] text-xs bg-black text-white px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none shadow-xl"
                >
                  {item.label}
                </motion.span>
              </AnimatePresence>
            </NavLink>
          ))}

          {/* Logout */}
          {token && (
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-gray-800 px-3 py-1.5 border rounded-lg hover:bg-gray-100"
            >
              <FaSignOutAlt className="h-6 w-6" />
            </button>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2"
          onClick={() => setMobileMenu(!mobileMenu)}
        >
          ☰
        </button>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileMenu && (
          <motion.div
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="md:hidden bg-white border-t shadow-lg"
          >
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setMobileMenu(false)}
                className="flex items-center gap-3 px-5 py-3 text-gray-700 hover:bg-gray-100"
              >
                {item.icon}
                <span>{item.label}</span>
              </NavLink>
            ))}

            {token && (
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 w-full px-5 py-3 text-gray-700 border-t hover:bg-gray-100"
              >
                <FaSignOutAlt className="h-6 w-6" />
                Logout
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
