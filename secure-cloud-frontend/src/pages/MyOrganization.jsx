// MyOrganization.js — Reimagined Professional Black & White Glassmorphic UI
import React, { useEffect, useState } from "react";
import api from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building,
  UserCircle2,
  ShieldCheck,
  XCircle,
  DoorOpen,
  BadgeCheck,
} from "lucide-react";
import defaultBg from "../assets/Back2.jpg";

const getRoleLabel = (role) => {
  if (!role) return "";
  if (role.toLowerCase().includes("org")) return "Organization Admin";
  if (role.toLowerCase().includes("dept")) return "Department Admin";
  if (role.toLowerCase().includes("admin")) return "Admin";
  return role.charAt(0).toUpperCase() + role.slice(1);
};

const MyOrganization = ({ backgroundImage }) => {
  const { token, setUser } = useAuth();
  const [org, setOrg] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);
  const [message, setMessage] = useState("");
  const [joinCode, setJoinCode] = useState("");

  const fetchOrg = async () => {
    setLoading(true);
    setErr(null);
    try {
      const res = await api.get("/users/my-org-info", {
        headers: { Authorization: `Bearer ${token}` },
      });
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

  useEffect(() => {
    if (token) fetchOrg();
  }, [token]);

  const handleJoinOrg = async (e) => {
    e.preventDefault();
    setMessage("");
    setErr("");
    try {
      const res = await api.post(
        "/users/join-org",
        { joinCode },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage(res.data.message || "Joined successfully!");
      setJoinCode("");
      const { data: userData } = await api.get("/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (userData?.user && typeof setUser === "function") setUser(userData.user);
      await fetchOrg();
    } catch (error) {
      setErr(error.response?.data?.message || "Invalid join code or server error.");
    }
  };

  const handleLeaveOrg = async () => {
    if (!window.confirm("Are you sure you want to leave your organization?")) return;
    try {
      const res = await api.post(
        "/users/leave-org",
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage(res.data.message || "You have left your organization.");
      setOrg(null);
    } catch (error) {
      setErr(error.response?.data?.message || "Server error while leaving organization.");
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center py-10 px-4 relative overflow-hidden"
      style={{
        backgroundImage: `url(${backgroundImage || defaultBg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-white/80 backdrop-blur-[3px]" />

      {/* Container */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-20 max-w-[1100px] w-full bg-white/95 backdrop-blur-3xl rounded-3xl border border-black/20 shadow-lg p-8 flex flex-col gap-8"
      >
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12 }}
          className="text-center"
        >
          <div className="flex justify-center items-center gap-3 mb-2">
            <Building size={42} className="text-black" />
            <h1 className="text-4xl font-extrabold text-black tracking-tight">
              My Organization
            </h1>
          </div>
          <p className="text-black/70 text-base">
            Manage your organization and access department details.
          </p>
        </motion.div>

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center mt-16">
            <span className="h-10 w-10 border-4 border-t-black border-b-transparent rounded-full animate-spin" />
            <span className="text-black/60 mt-3 text-lg animate-pulse">
              Loading organization details...
            </span>
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
              className="flex items-center justify-center gap-3 bg-red-100 text-red-900 border border-red-300 p-3 rounded-xl font-semibold text-base shadow-md"
            >
              <XCircle size={20} className="text-red-900" strokeWidth={2} />
              {err}
            </motion.div>
          )}

          {message && (
            <motion.div
              key="message"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="bg-green-100 text-green-900 border border-green-300 rounded-xl py-2 px-6 font-semibold text-center shadow-md"
            >
              {message}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Content: org info & admins */}
        {!loading && org && (
          <div className="flex flex-col lg:flex-row gap-10">
            {/* Organization Info */}
            <div className="flex-1 flex flex-col gap-5 justify-center">
              <div className="flex items-center gap-3 text-black font-bold text-2xl">
                <Building size={26} /> <span>{org.name}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-700 text-lg">
                <BadgeCheck size={20} /> <span className="capitalize">{org.type}</span>
              </div>
              {org.parent && (
                <div className="text-gray-600 italic text-base">
                  <span className="font-semibold">Parent:</span>{" "}
                  <span className="text-black">
                    {typeof org.parent === "object" ? org.parent?.name : org.parent}
                  </span>
                </div>
              )}
              <motion.button
                whileHover={{ scale: 1.05 }}
                className="inline-flex items-center gap-2 bg-black text-white font-semibold rounded-full px-7 py-3 shadow-lg hover:bg-gray-900 transition"
                onClick={handleLeaveOrg}
              >
                <DoorOpen size={20} /> Leave Organization
              </motion.button>
            </div>

            {/* Admins Section */}
            <div className="flex-1 flex flex-col gap-6">
              <div className="flex items-center gap-3 text-black font-semibold text-2xl border-b border-black/20 pb-2">
                <UserCircle2 size={22} /> Administrators
              </div>

              {/* Admins container */}
              <div className="flex flex-col sm:flex-row sm:flex-wrap gap-5 max-h-[400px] overflow-y-auto scrollbar-thin scrollbar-thumb-black/40 scrollbar-track-white/70">
                {org.admins?.length > 0 ? (
                  org.admins.map((admin) => (
                    <motion.div
                      key={admin.id}
                      whileHover={{ scale: 1.04 }}
                      className="bg-black/5 rounded-xl px-5 py-4 shadow hover:shadow-black/25 transition flex flex-col gap-1 w-full sm:w-[calc(50%-0.625rem)] md:w-[calc(33.333%-0.833rem)]"
                    >
                      <span className="font-semibold text-black text-lg truncate" title={admin.name}>
                        {admin.name}
                      </span>
                      <span
                        className="text-sm text-black/70 truncate"
                        title={admin.email}
                      >
                        {admin.email}
                      </span>
                      <span className="mt-2 inline-block rounded-full bg-black/90 text-white uppercase font-semibold text-xs px-3 py-1 select-none">
                        {getRoleLabel(admin.role)}
                      </span>
                    </motion.div>
                  ))
                ) : (
                  <p className="text-gray-400 text-center w-full">No admins assigned</p>
                )}
              </div>

              <div className="text-center mt-4">
                <span className="inline-flex items-center bg-black/10 px-4 py-1 text-xs text-black rounded-full shadow-sm backdrop-blur-sm select-none">
                  <ShieldCheck size={16} strokeWidth={2} className="mr-1 text-black/70" />
                  Organization details synced in real time
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Join Form when no org */}
        {!loading && !org && !err && (
          <motion.form
            onSubmit={handleJoinOrg}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-3xl w-full mx-auto bg-white/90 backdrop-blur-xl rounded-2xl p-8 border border-black/20 shadow-lg hover:shadow-black/30 transition flex flex-col gap-6"
          >
            <h3 className="text-center text-3xl font-extrabold text-black">
              Join an Organization / Department
            </h3>
            <input
              type="text"
              placeholder="Enter Join Code"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value)}
              className="w-full border border-black/20 rounded-xl p-4 text-black text-lg placeholder-black/50 focus:outline-none focus:ring-4 focus:ring-black/40 transition"
              required
            />
            <motion.button
              whileHover={{ scale: 1.06 }}
              type="submit"
              className="w-full py-4 bg-gradient-to-r from-black via-gray-900 to-black text-white font-bold text-xl rounded-full shadow-lg"
            >
              <ShieldCheck size={20} className="inline-block mr-3" />
              Join
            </motion.button>
          </motion.form>
        )}
      </motion.div>
    </div>
  );
};

export default MyOrganization;
