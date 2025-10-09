// MyOrganization.js
import React, { useEffect, useState } from "react";
import api from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import { motion } from "framer-motion";

import {
  HiOutlineXCircle,
  HiOutlineUserCircle,
} from "react-icons/hi";

import {
  HiOutlineBuildingLibrary,
  HiOutlineUserGroup,
  HiOutlineIdentification,
} from "react-icons/hi2";

import defaultBg from "../assets/back1.jpg";

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
      if (userData && userData.user && typeof setUser === "function")
        setUser(userData.user);

      await fetchOrg();
    } catch (error) {
      setErr(error.response?.data?.message || "Invalid join code or server error.");
    }
  };

  const handleLeaveOrg = async () => {
    if (!window.confirm("Are you sure you want to leave your organization?")) return;
    try {
      const res = await api.post("/users/leave-org", {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessage(res.data.message || "You have left your organization.");
      setOrg(null);
    } catch (error) {
      setErr(error.response?.data?.message || "Server error while leaving organization.");
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center py-8 px-4 sm:px-6 lg:px-8 relative overflow-auto"
      style={{
        backgroundImage: `linear-gradient(rgba(0,0,0,0.45), rgba(0,0,0,0.45)), url(${
          backgroundImage || defaultBg
        })`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
        backgroundRepeat: "no-repeat",
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 w-full max-w-4xl sm:p-12 p-4 rounded-3xl bg-white/20 backdrop-blur-3xl border border-white/20 shadow-2xl space-y-6 sm:space-y-8 transition-all duration-500 hover:shadow-indigo-600/50"
      >
        {/* Header */}
        <h1 className="text-3xl sm:text-5xl font-extrabold text-center tracking-tight flex flex-col sm:flex-row justify-center items-center gap-2 sm:gap-3 drop-shadow-md">
          <HiOutlineBuildingLibrary className="inline-block text-3xl sm:text-5xl text-white" />
          <span className="text-white text-center">My Organization</span>
        </h1>

        {/* Loader */}
        {loading && (
          <div className="flex flex-col gap-3 items-center">
            <span className="inline-block h-12 w-12 rounded-full border-4 border-blue-400 border-b-transparent animate-spin"></span>
            <span className="text-lg text-gray-200 animate-pulse">Loading organization ...</span>
          </div>
        )}

        {/* Error */}
        {!loading && err && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center justify-center gap-2 text-red-800 bg-red-100/60 border border-red-300/50 p-3 rounded-2xl font-semibold backdrop-blur-sm shadow-md"
          >
            <HiOutlineXCircle className="text-xl" /> {err}
          </motion.div>
        )}

        {/* Success message */}
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-green-800 bg-green-100/60 rounded-2xl py-2 font-semibold text-center backdrop-blur-sm shadow-md"
          >
            {message}
          </motion.div>
        )}

        {/* Organization card */}
        {!loading && org && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col gap-4 sm:gap-6"
          >
            <div className="flex flex-col sm:flex-row justify-end gap-2">
              <button
                className="flex items-center justify-center gap-2 bg-gradient-to-r from-red-400 via-pink-300 to-red-200 text-white rounded-full px-5 py-2 font-semibold text-sm shadow-lg hover:shadow-red-300/50 transition transform hover:scale-105"
                onClick={handleLeaveOrg}
                title="Leave organization"
              >
                <HiOutlineUserGroup className="text-lg" />
                Leave Organization
              </button>
            </div>

            <div className="rounded-3xl border border-white/20 bg-gradient-to-r from-white/30 via-white/20 to-white/30 backdrop-blur-3xl p-4 sm:p-6 flex flex-col gap-4 shadow-xl transition hover:shadow-2xl hover:scale-105 transform">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 text-blue-900 text-lg font-bold">
                <HiOutlineBuildingLibrary className="text-2xl" />
                {org.name}
              </div>
              <div className="flex items-center gap-2 text-gray-700 text-md">
                <HiOutlineIdentification className="text-lg" />
                <span className="capitalize">{org.type}</span>
              </div>
              {org.parent && (
                <div className="flex items-center gap-2 text-gray-700">
                  <span className="font-semibold text-gray-800">Parent:</span>
                  <span className="italic text-teal-600">{typeof org.parent === "object" ? org.parent?.name : org.parent}</span>
                </div>
              )}

              {/* Admins */}
              <div>
                <div className="flex items-center gap-2 mb-2 text-blue-700 font-semibold">
                  <HiOutlineUserCircle className="text-lg" />
                  Admins
                </div>
                <div className="flex flex-col gap-2">
                  {org.admins && org.admins.length > 0 ? (
                    org.admins.map((admin) =>
                      admin ? (
                        <motion.div
                          key={admin.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="flex flex-col sm:flex-row sm:items-center justify-between bg-gradient-to-r from-blue-100 via-teal-100 to-indigo-100 rounded-xl px-3 py-2 shadow-md gap-1 sm:gap-0 hover:scale-105 transition transform"
                        >
                          <span className="font-bold text-blue-900">{admin.name}</span>
                          <span className="text-xs text-gray-700">{admin.email}</span>
                          <span className="inline-block text-xs rounded-full px-2 py-0.5 bg-gradient-to-r from-blue-500 to-teal-500 text-white capitalize ml-0 sm:ml-2">
                            {admin.role.replace("Admin", " Admin")}
                          </span>
                        </motion.div>
                      ) : null
                    )
                  ) : (
                    <span className="text-gray-400">No admins assigned</span>
                  )}
                </div>
              </div>

              <div className="mt-4 flex items-center justify-center">
                <span className="inline-flex items-center bg-blue-50/40 px-3 py-1 text-xs text-blue-700 rounded-full shadow-sm backdrop-blur-sm">
                  <svg
                    className="h-4 w-4 mr-1 text-blue-400"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <circle cx="12" cy="12" r="10" strokeDasharray="2 2" />
                  </svg>
                  Organization details are always up to date.
                </span>
              </div>
            </div>
          </motion.div>
        )}

        {/* Join form */}
        {!loading && !org && !err && (
          <motion.form
            onSubmit={handleJoinOrg}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-gradient-to-r from-white/40 via-white/30 to-white/40 backdrop-blur-3xl rounded-3xl shadow-xl p-6 sm:p-8 space-y-4 sm:space-y-6 border border-white/30 transition hover:shadow-2xl hover:scale-105 transform"
          >
            <h3 className="text-xl sm:text-2xl font-bold text-center text-gray-800 mb-3 sm:mb-4 drop-shadow-sm">
              Join an Organization / Department
            </h3>
            <input
              type="text"
              placeholder="Enter Join Code"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value)}
              className="w-full p-3 rounded-xl border border-gray-300 text-gray-800 focus:ring-2 focus:ring-blue-500 outline-none transition backdrop-blur-sm"
            />
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-500 via-teal-500 to-indigo-500 hover:from-indigo-500 hover:via-blue-500 hover:to-teal-500 text-white font-bold text-lg py-3 rounded-full shadow-lg transition transform hover:scale-105"
            >
              Join
            </button>
          </motion.form>
        )}
      </motion.div>
    </div>
  );
};

export default MyOrganization;
