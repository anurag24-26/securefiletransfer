import React, { useState, useRef, useEffect } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import logo from "../assets/logo.jpg";
import { 
  Menu, X, Settings, LogOut, User, Users, Sliders, FileText, 
  Home, Briefcase, Folder 
} from 'lucide-react';

// --- Utility Dropdown ---
const DropdownMenu = ({ children, trigger, className = "" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-full transition duration-150 ease-in-out hover:bg-white/40"
      >
        {trigger}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -5 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -5 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-3 w-48 origin-top-right 
              bg-white/70 backdrop-blur-xl 
              border border-white/40 rounded-2xl shadow-lg z-50"
          >
            <div className="py-1" onClick={() => setIsOpen(false)}>
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const DropdownItem = ({ to, label, Icon }) => {
  const activeClass = "bg-white/50 text-[#0A1A4F]";

  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center px-4 py-2 text-sm text-gray-700 
          hover:bg-white/40 backdrop-blur-md transition rounded-md
          ${isActive ? activeClass : ""}`
      }
    >
      <Icon className="mr-3 h-4 w-4" />
      {label}
    </NavLink>
  );
};

// --- NAVBAR ---
const Navbar = () => {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const commonLinks = [
    { to: "/", label: "Home", icon: Home },
    { to: "/myOrganization", label: "My Organization", icon: Briefcase },
    { to: "/yourfiles", label: "Your Files", icon: Folder },
  ];

  const authLinks = [{ to: "/login", label: "Login/Signup" }];

  const adminLinks = [];
  const isAdmin = user && ["superAdmin", "orgAdmin", "deptAdmin"].includes(user.role);

  if (isAdmin) {
    adminLinks.push(
      { to: "/adminSettings", label: "Admin Settings", icon: Sliders },
      { to: "/orglist", label: "Organizations", icon: Users },
      { to: "/logs", label: "Logs", icon: FileText }
    );
  }

  const activeClass = "bg-white/50 text-[#0A1A4F] font-semibold";

  return (
    <nav className="
      fixed top-0 w-full z-50 
      bg-white/25 backdrop-blur-xl 
      border-b border-white/40 
      shadow-[0_4px_20px_rgba(0,0,0,0.05)]
      font-[Inter]
    ">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">

          {/* LOGO + BRAND */}
          <Link to="/" className="flex items-center gap-3">
            <img
              src={logo}
              alt="Crypterra Logo"
              className="h-10 w-10 rounded-full border border-white/40 shadow-sm object-cover"
            />

            <span
              className="text-2xl font-bold tracking-tight"
              style={{
                fontFamily: "Orbitron, sans-serif",
                color: "#0A1A4F",
                letterSpacing: "0.02em"
              }}
            >
              Crypterra
            </span>
          </Link>

          {/* DESKTOP MENU */}
          <div className="
            hidden md:flex items-center space-x-2 
            p-1 rounded-full 
            bg-white/30 backdrop-blur-xl 
            border border-white/40 shadow-inner
          ">

            {commonLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `flex items-center px-4 py-2 text-sm font-medium rounded-full 
                   transition-all 
                   ${isActive 
                      ? activeClass 
                      : "text-gray-700 hover:bg-white/40 hover:text-[#0A1A4F]"}`}
              >
                <link.icon className="h-4 w-4 mr-2" />
                {link.label}
              </NavLink>
            ))}

            {!token && authLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `px-4 py-2 text-sm font-medium rounded-full transition-all
                  ${isActive 
                    ? "bg-[#0A1A4F] text-white" 
                    : "text-[#0A1A4F] border border-[#0A1A4F]/40 hover:bg-[#0A1A4F]/10"}`}
              >
                {link.label}
              </NavLink>
            ))}

            {/* USER + ADMIN ICONS */}
            {token && (
              <div className="flex items-center space-x-1 ml-2 bg-white/20 backdrop-blur-lg rounded-full px-2 py-1">

                {isAdmin && (
                  <DropdownMenu trigger={<Settings className="h-5 w-5 text-gray-700" />}>
                    <div className="block px-4 py-2 text-xs font-semibold text-gray-500">Admin Tools</div>
                    {adminLinks.map(link => (
                      <DropdownItem key={link.to} to={link.to} label={link.label} Icon={link.icon} />
                    ))}
                  </DropdownMenu>
                )}

                <DropdownMenu trigger={<User className="h-5 w-5 text-gray-700" />}>
                  {user && (
                    <>
                      <div className="block px-4 py-2 text-sm text-gray-900 font-medium truncate">{user.email}</div>
                      <div className="block px-4 pb-2 text-xs text-gray-500 capitalize border-b border-gray-100">{user.role}</div>
                    </>
                  )}
                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    <LogOut className="mr-3 h-4 w-4" /> Logout
                  </button>
                </DropdownMenu>
              </div>
            )}
          </div>

          {/* MOBILE TOGGLE */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-md hover:bg-white/40 backdrop-blur-xl"
          >
            {mobileMenuOpen ? <X className="h-6 w-6 text-[#0A1A4F]" /> : <Menu className="h-6 w-6 text-[#0A1A4F]" />}
          </button>

        </div>
      </div>

      {/* MOBILE MENU */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="
              md:hidden bg-white/60 
              backdrop-blur-xl 
              border-t border-white/40
            "
          >
            <div className="py-3 space-y-1">

              {[...commonLinks, ...(token ? [] : authLinks)].map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    "flex items-center px-4 py-2 text-base transition rounded-md " +
                    (isActive 
                      ? "text-[#0A1A4F] bg-white/40" 
                      : "text-gray-800 hover:bg-white/50")}
                >
                  <link.icon className="mr-3 h-5 w-5" />
                  {link.label}
                </NavLink>
              ))}

              {isAdmin && (
                <div className="border-t border-white/40 pt-2">
                  <div className="px-4 py-2 text-sm font-semibold text-gray-600">Admin Tools</div>
                  {adminLinks.map(link => (
                    <NavLink
                      key={link.to}
                      to={link.to}
                      onClick={() => setMobileMenuOpen(false)}
                      className={({ isActive }) =>
                        "flex items-center px-4 py-2 text-base rounded-md transition " +
                        (isActive 
                          ? "text-[#0A1A4F] bg-white/40" 
                          : "text-gray-700 hover:bg-white/50")}
                    >
                      <link.icon className="mr-3 h-5 w-5" /> {link.label}
                    </NavLink>
                  ))}
                </div>
              )}

              {token && (
                <button
                  onClick={handleLogout}
                  className="flex items-center w-[90%] mx-auto mt-3 border border-red-300 py-2 rounded-full 
                  text-red-600 font-medium hover:bg-red-50"
                >
                  <LogOut className="mr-2 h-5 w-5" /> Logout
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
