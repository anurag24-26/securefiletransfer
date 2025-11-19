import React, { useState, useRef, useEffect } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import logo from "../assets/logo.jpg";

import {
  Menu,
  X,
  Settings,
  LogOut,
  User,
  Users,
  Sliders,
  FileText,
  Home,
  Briefcase,
  Folder,
} from "lucide-react";

// ------------------------------
// SAFE DROPDOWN FOR MOBILE
// ------------------------------
const DropdownMenu = ({ children, trigger }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((p) => !p)}
        className="p-2 rounded-full hover:bg-white/30 backdrop-blur-sm transition"
      >
        {trigger}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -4 }}
            className="absolute right-0 mt-3 w-48 bg-white/60 backdrop-blur-xl border border-white/30 shadow-lg rounded-xl z-50"
          >
            <div className="py-1">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const DropdownItem = ({ to, label, Icon }) => (
  <NavLink
    to={to}
    className="flex items-center px-4 py-2 text-sm hover:bg-white/40 transition rounded-md"
  >
    <Icon className="mr-3 h-4 w-4" />
    {label}
  </NavLink>
);

// ------------------------------
// NAVBAR COMPONENT
// ------------------------------
const Navbar = () => {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenu, setMobileMenu] = useState(false);

  const isAdmin =
    user && ["superAdmin", "orgAdmin", "deptAdmin"].includes(user.role);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const commonLinks = [
    { to: "/", label: "Home", icon: Home },
    { to: "/myOrganization", label: "My Organization", icon: Briefcase },
    { to: "/yourfiles", label: "Your Files", icon: Folder },
  ];

  const adminLinks = isAdmin
    ? [
        { to: "/adminSettings", label: "Admin Settings", icon: Sliders },
        { to: "/orglist", label: "Organizations", icon: Users },
        { to: "/logs", label: "Logs", icon: FileText },
      ]
    : [];

  const authLinks = [{ to: "/login", label: "Login/Signup" }];

  return (
    <nav className="fixed top-0 w-full z-50 
      bg-white/50 backdrop-blur-xl 
      border-b border-white/30 shadow-[0_4px_12px_rgba(0,0,0,0.08)]">
      
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3">
          <img
            src={logo}
            alt="logo"
            className="h-10 w-10 rounded-full border border-white/50 shadow-sm"
          />
          <span
            className="text-2xl font-bold"
            style={{ fontFamily: "Orbitron, sans-serif", color: "#0A1A4F" }}
          >
            Crypterra
          </span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-2 p-1 
          bg-white/40 backdrop-blur-xl 
          rounded-full border border-white/30 shadow-sm">
          
          {commonLinks.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className="flex items-center gap-2 px-4 py-2 rounded-full
              hover:bg-white/60 transition"
              style={{
                color: "#0A1A4F",
                fontWeight: 600,
              }}
            >
              <l.icon className="h-4 w-4" style={{ color: "#0A1A4F" }} />
              {l.label}
            </NavLink>
          ))}

          {token && (
            <div className="flex items-center gap-1 ml-1">
              
              {/* Admin Dropdown */}
              {isAdmin && (
                <DropdownMenu trigger={<Settings className="h-5 w-5 text-[#0A1A4F]" />} >
                  <div className="px-4 py-1 text-xs font-semibold text-gray-600">
                    Admin Tools
                  </div>
                  {adminLinks.map((a) => (
                    <DropdownItem
                      key={a.to}
                      to={a.to}
                      label={a.label}
                      Icon={a.icon}
                    />
                  ))}
                </DropdownMenu>
              )}

              {/* User Dropdown */}
              <DropdownMenu trigger={<User className="h-5 w-5 text-[#0A1A4F]" />} >
                <div className="px-4 py-2 font-medium text-sm border-b border-white/40">
                  {user.email}
                </div>
                <div className="px-4 py-2 text-xs capitalize text-gray-600">
                  {user.role}
                </div>
              </DropdownMenu>

              {/* Logout */}
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 
                text-red-600 border border-red-300 rounded-full
                hover:bg-red-50 transition"
              >
                <LogOut className="h-4 w-4" /> Logout
              </button>
            </div>
          )}

          {!token &&
            authLinks.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                className="px-4 py-2 rounded-full 
                border border-indigo-300 text-indigo-600 
                hover:bg-indigo-50 transition"
              >
                {l.label}
              </NavLink>
            ))}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2"
          onClick={() => setMobileMenu((p) => !p)}
        >
          {mobileMenu ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenu && (
          <motion.div
            initial={{ opacity: 0, scaleY: 0 }}
            animate={{ opacity: 1, scaleY: 1 }}
            exit={{ opacity: 0, scaleY: 0 }}
            transition={{ duration: 0.25 }}
            className="md:hidden origin-top
            bg-white/50 backdrop-blur-xl border-t border-white/30"
          >
            <div className="py-3 flex flex-col gap-1">

              {commonLinks.map((l) => (
                <NavLink
                  key={l.to}
                  to={l.to}
                  onClick={() => setMobileMenu(false)}
                  className="flex items-center gap-3 px-4 py-2 
                  hover:bg-white/40 transition rounded-md"
                  style={{ color: "#0A1A4F", fontWeight: 600 }}
                >
                  <l.icon className="h-5 w-5" style={{ color: "#0A1A4F" }} />
                  {l.label}
                </NavLink>
              ))}

              {isAdmin && (
                <>
                  <div className="px-4 py-2 text-sm text-gray-600 font-semibold">
                    Admin Tools
                  </div>
                  {adminLinks.map((a) => (
                    <NavLink
                      key={a.to}
                      to={a.to}
                      onClick={() => setMobileMenu(false)}
                      className="flex items-center gap-3 px-4 py-2 
                      hover:bg-white/40 transition rounded-md"
                    >
                      <a.icon className="h-5 w-5" />
                      {a.label}
                    </NavLink>
                  ))}
                </>
              )}

              {token ? (
                <button
                  onClick={handleLogout}
                  className="flex items-center justify-center gap-2 w-[90%] mx-auto mt-3 px-4 py-2 
                  rounded-full border border-red-300 text-red-600 
                  hover:bg-red-50 transition"
                >
                  <LogOut className="h-5 w-5" /> Logout
                </button>
              ) : (
                authLinks.map((l) => (
                  <NavLink
                    key={l.to}
                    to={l.to}
                    onClick={() => setMobileMenu(false)}
                    className="px-4 py-2 text-indigo-600 text-center 
                    border border-indigo-300 rounded-full mx-4 
                    hover:bg-indigo-50 transition"
                  >
                    {l.label}
                  </NavLink>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
