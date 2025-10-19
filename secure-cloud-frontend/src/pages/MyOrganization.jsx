// MyOrganization.js — Modern Glassmorphic & Fully Responsive UI ✨
import React, { useEffect, useState } from "react";
import api from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { HiOutlineXCircle, HiOutlineUserCircle } from "react-icons/hi";
import { HiOutlineBuildingLibrary, HiOutlineUserGroup, HiOutlineIdentification } from "react-icons/hi2";
import defaultBg from "../assets/back2.jpg";

const MyOrganization = ({ backgroundImage }) => {
  const { token, setUser } = useAuth();
  const [org, setOrg] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);
  const [joinCode, setJoinCode] = useState("");
  const [message, setMessage] = useState("");

  const fetchOrg = async () => {
    setLoading(true);
    setErr(null);
    try {
      const res = await api.get("/users/my-org-info", { headers: { Authorization: `Bearer ${token}` } });
      setOrg(res.data.organization || null);
    } catch (error) {
      const data = error.response?.data;
      if (data?.allowJoin) {
        setOrg(null);
        setErr(null);
      } else {
        setErr(data?.message || "Could not fetch organization details.");
        setOrg(null);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (token) fetchOrg(); }, [token]);

  const handleJoinOrg = async (e) => {
    e.preventDefault();
    setMessage("");
    setErr("");
    try {
      const res = await api.post("/users/join-org", { joinCode }, { headers: { Authorization: `Bearer ${token}` } });
      setMessage(res.data.message || "Joined successfully!");
      setJoinCode("");

      const { data: userData } = await api.get("/auth/me", { headers: { Authorization: `Bearer ${token}` } });
      if (userData?.user && typeof setUser === "function") setUser(userData.user);

      await fetchOrg();
    } catch (error) {
      setErr(error.response?.data?.message || "Invalid join code or server error.");
    }
  };

  const handleLeaveOrg = async () => {
    if (!window.confirm("Are you sure you want to leave your organization?")) return;
    try {
      const res = await api.post("/users/leave-org", {}, { headers: { Authorization: `Bearer ${token}` } });
      setMessage(res.data.message || "You have left your organization.");
      setOrg(null);
    } catch (error) {
      setErr(error.response?.data?.message || "Server error while leaving organization.");
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center py-10 px-3 sm:px-6 relative overflow-auto"
      style={{
        backgroundImage: `url(${backgroundImage || defaultBg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/80 via-slate-900/40 to-black/80 backdrop-blur-[2px]" />

      {/* Main Card */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 w-full max-w-3xl rounded-[2rem] bg-white/15 backdrop-blur-3xl border border-white/20 shadow-[0_12px_50px_rgba(0,0,0,0.4)] p-5 sm:p-10"
      >
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-center mb-6 sm:mb-10">
          <div className="flex flex-col sm:flex-row justify-center items-center gap-3 mb-2 sm:mb-3">
            <HiOutlineBuildingLibrary className="text-4xl sm:text-5xl text-indigo-300 drop-shadow-md" />
            <h1 className="text-3xl sm:text-5xl font-extrabold bg-gradient-to-r from-indigo-200 via-blue-100 to-teal-200 text-transparent bg-clip-text">
              My Organization
            </h1>
          </div>
          <p className="text-gray-200 text-xs sm:text-base px-2">
            Manage your organization and access department-level details.
          </p>
        </motion.div>

        {/* Loader */}
        {loading && (
          <div className="flex flex-col items-center mt-10">
            <span className="h-10 w-10 sm:h-12 sm:w-12 border-4 border-t-indigo-400 border-b-transparent rounded-full animate-spin"></span>
            <span className="text-gray-100 mt-3 animate-pulse text-sm sm:text-lg">Loading organization details...</span>
          </div>
        )}

        {/* Alerts */}
        <AnimatePresence>
          {err && !loading && (
            <motion.div
              key="error"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-6 flex items-center justify-center gap-2 text-red-900 bg-red-100/90 border border-red-200 p-3 rounded-xl font-semibold shadow-md text-sm sm:text-base"
            >
              <HiOutlineXCircle className="text-lg sm:text-xl" /> {err}
            </motion.div>
          )}
          {message && (
            <motion.div
              key="message"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-6 text-green-900 bg-green-100/90 border border-green-200 rounded-xl py-2 px-3 font-semibold text-center shadow-md text-sm sm:text-base"
            >
              {message}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Organization Details */}
        {!loading && org && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="mt-8 space-y-5 sm:space-y-6">
            {/* Leave Button */}
            <div className="flex justify-center sm:justify-end">
              <motion.button
                whileHover={{ scale: 1.05, rotate: 1 }}
                className="flex items-center gap-2 bg-gradient-to-r from-pink-500 via-red-400 to-orange-400 text-white font-semibold rounded-full px-4 sm:px-6 py-2 text-sm sm:text-base shadow-md hover:shadow-pink-500/40 transition-all"
                onClick={handleLeaveOrg}
              >
                <HiOutlineUserGroup className="text-lg" /> Leave Organization
              </motion.button>
            </div>

            {/* Info Card */}
            <motion.div
              whileHover={{ scale: 1.03 }}
              className="rounded-3xl border border-white/20 bg-white/20 backdrop-blur-3xl p-5 sm:p-6 shadow-lg hover:shadow-indigo-400/40 transition-all"
            >
              <div className="flex flex-wrap items-center gap-2 text-indigo-900 font-bold text-lg sm:text-xl">
                <HiOutlineBuildingLibrary className="text-2xl text-indigo-700" />
                <span>{org.name}</span>
              </div>

              <div className="flex flex-wrap items-center gap-2 text-gray-800 mt-2 text-sm sm:text-base">
                <HiOutlineIdentification className="text-lg text-indigo-600" />
                <span className="capitalize">{org.type}</span>
              </div>

              {org.parent && (
                <div className="text-gray-700 italic mt-2 text-sm sm:text-base">
                  <span className="font-semibold">Parent:</span>{" "}
                  <span className="text-teal-700">{typeof org.parent === "object" ? org.parent?.name : org.parent}</span>
                </div>
              )}

              {/* Admins Section */}
              <div className="mt-6">
                <div className="flex items-center gap-2 mb-2 text-blue-700 font-semibold text-base sm:text-lg">
                  <HiOutlineUserCircle className="text-lg" /> Admins
                </div>
                <div className="flex flex-col gap-2">
                  {org.admins?.length > 0 ? (
                    org.admins.map((admin) => (
                      <motion.div
                        key={admin.id}
                        whileHover={{ scale: 1.02, x: 3 }}
                        className="flex flex-col sm:flex-row sm:items-center justify-between bg-gradient-to-r from-indigo-50 via-blue-50 to-teal-50 rounded-xl px-3 sm:px-4 py-2 shadow-sm hover:shadow-indigo-300 transition-all"
                      >
                        <span className="font-bold text-blue-900 text-sm sm:text-base">{admin.name}</span>
                        <span className="text-xs sm:text-sm text-gray-700 truncate">{admin.email}</span>
                        <span className="inline-block text-[11px] sm:text-xs rounded-full px-2 py-0.5 bg-gradient-to-r from-indigo-500 to-teal-500 text-white capitalize mt-1 sm:mt-0">
                          {admin.role.replace("Admin", " Admin")}
                        </span>
                      </motion.div>
                    ))
                  ) : (
                    <span className="text-gray-400 text-xs sm:text-sm">No admins assigned</span>
                  )}
                </div>
              </div>

              {/* Footer note */}
              <div className="mt-4 text-center">
                <span className="inline-flex items-center bg-white/60 px-3 py-1 text-[11px] sm:text-xs text-blue-700 rounded-full shadow-sm backdrop-blur-sm">
                  <svg className="h-4 w-4 mr-1 text-blue-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" strokeDasharray="2 2" />
                  </svg>
                  Organization details synced in real time
                </span>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Join Form */}
        {!loading && !org && !err && (
          <motion.form
            onSubmit={handleJoinOrg}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mt-10 bg-white/20 backdrop-blur-3xl rounded-3xl p-5 sm:p-8 space-y-5 border border-white/30 shadow-2xl hover:shadow-indigo-400/40 transform hover:scale-[1.03] transition-all"
          >
            <h3 className="text-xl sm:text-2xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-indigo-200 via-blue-100 to-teal-200">
              Join an Organization / Department
            </h3>
            <input
              type="text"
              placeholder="Enter Join Code"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value)}
              className="w-full p-3 rounded-xl border border-gray-300 text-gray-800 text-sm sm:text-base focus:ring-2 focus:ring-indigo-500 outline-none transition"
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              type="submit"
              className="w-full bg-gradient-to-r from-indigo-500 via-teal-500 to-blue-500 hover:from-blue-600 hover:via-indigo-500 hover:to-teal-500 text-white font-bold text-base sm:text-lg py-3 rounded-full shadow-lg transition-all"
            >
              Join
            </motion.button>
          </motion.form>
        )}
      </motion.div>
    </div>
  );
};

export default MyOrganization;
