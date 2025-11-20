import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import api from "../services/api";
import { useNavigate } from "react-router-dom";
import Loader from "../components/Loader";
import { motion } from "framer-motion";
import {
  FaEdit,
  FaTimes,
  FaUserCircle,
  FaCheck,
  FaTimesCircle,
  FaUpload,
  FaFolder,
} from "react-icons/fa";

// -------------------------------------------------------------
// Premium Modern Dashboard — Home.jsx
// -------------------------------------------------------------
export default function Home() {
  const { user, token, logout, setUser } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [adminRequests, setAdminRequests] = useState([]);
  const [myRequests, setMyRequests] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [updating, setUpdating] = useState(false);

  // -------------------------------------------------------------
  // Fetch User + Requests
  // -------------------------------------------------------------
  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    const fetchData = async () => {
      try {
        const { data: userData } = await api.get("/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(userData.user);

        if (["superAdmin", "orgAdmin", "deptAdmin"].includes(userData.user.role)) {
          const { data: adminReqData } = await api.get("/requests", {
            headers: { Authorization: `Bearer ${token}` },
          });
          setAdminRequests(adminReqData.requests || []);
        }

        const { data: myReqData } = await api.get("/requests/my-requests", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMyRequests(myReqData.requests || []);
      } catch (err) {
        setError("⚠️ Session expired. Please login again.");
        logout();
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token, setUser, logout, navigate]);

  // -------------------------------------------------------------
  // Approve / Reject Requests
  // -------------------------------------------------------------
  const respondToRequest = async (id, action) => {
    try {
      const { data } = await api.post(
        `/requests/${id}/action`,
        { action },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert(data.message);

      setAdminRequests((prev) => prev.filter((r) => r._id !== id));
      setMyRequests((prev) => prev.filter((r) => r._id !== id));

      if (action === "approve" && data.user) setUser(data.user);
    } catch (err) {
      alert(err?.response?.data?.message || "❌ Failed to respond. Try again.");
    }
  };

  // -------------------------------------------------------------
  // Handle Profile Update
  // -------------------------------------------------------------
  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      setUpdating(true);
      const formData = new FormData();
      if (editName) formData.append("name", editName);
      if (selectedFile) formData.append("avatar", selectedFile);

      const { data } = await api.put("/auth/update-profile", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      setUser(data.user);
      alert("✅ Profile updated successfully!");
      setIsEditing(false);
      setEditName("");
      setSelectedFile(null);
    } catch (err) {
      alert(err?.response?.data?.message || "❌ Update failed. Try again.");
    } finally {
      setUpdating(false);
    }
  };

  // -------------------------------------------------------------
  // Page States
  // -------------------------------------------------------------
  if (loading) return <Loader />;

  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-sm w-full bg-white/70 backdrop-blur-xl shadow-2xl rounded-3xl p-6 border border-white/40 text-center">
          <h3 className="text-lg font-semibold mb-2 text-slate-800">
            ⚠️ Session Error
          </h3>
          <p className="text-sm text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-5 py-2 bg-gradient-to-r from-indigo-500 to-violet-600 text-white rounded-xl shadow-md hover:from-indigo-600 hover:to-violet-700 transition"
          >
            🔄 Retry
          </button>
        </div>
      </div>
    );

  // -------------------------------------------------------------
  // Main UI
  // -------------------------------------------------------------
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 pt-10">

      <div className="max-w-7xl mx-auto px-4 pb-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

          {/* ---------------------------------------------------------
             LEFT — Profile Card
          --------------------------------------------------------- */}
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl border border-white/40 p-7 hover:shadow-2xl transition-all"
          >
            <div className="flex items-center gap-5">
              <div className="h-24 w-24 rounded-full bg-gradient-to-tr from-indigo-200 to-violet-200 overflow-hidden shadow-inner border border-white/40 flex items-center justify-center">
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt="avatar"
                    className="object-cover h-full w-full"
                  />
                ) : (
                  <FaUserCircle className="text-gray-300 text-7xl" />
                )}
              </div>

              <div className="flex-1">
                <h2 className="text-xl font-semibold text-slate-800 flex items-center gap-1">
                  {user?.name} <span className="text-lg">✨</span>
                </h2>
                <p className="text-sm text-gray-500">{user?.email}</p>

                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 border border-white/40 text-xs">
                    {user?.role ?? "—"}
                  </span>

                  {user?.org?.name && (
                    <span className="px-3 py-1 rounded-full bg-white text-slate-600 border border-white/40 text-xs shadow-sm">
                      🏢 {user.org.name}
                    </span>
                  )}
                </div>
              </div>

              {/* EDIT BUTTON */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-violet-600 text-white text-sm rounded-xl shadow-md hover:shadow-lg"
              >
                <FaEdit /> Edit
              </motion.button>
            </div>

            {/* Stats */}
            <div className="mt-7 grid grid-cols-2 gap-4">
              <StatCard title="👥 Users" value={user?.orgTotalUsers ?? 0} />
              <StatCard title="📁 Files" value={user?.orgTotalFiles ?? 0} />
            </div>

            {/* Storage Row */}
            <div className="mt-8">
              <h4 className="text-xs text-gray-500 mb-2">Storage Usage</h4>

              <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-500"
                  style={{
                    width: `${
                      user?.orgStorageLimit
                        ? Math.min(
                            100,
                            Math.round(
                              ((user?.orgUsedStorage || 0) /
                                user.orgStorageLimit) *
                                100
                            )
                          )
                        : 0
                    }%`,
                  }}
                />
              </div>

              <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
                <span>{formatBytes(user?.orgUsedStorage || 0)} used</span>
                <span>
                  {user?.orgStorageLimit
                    ? formatBytes(
                        Math.max(
                          0,
                          (user?.orgStorageLimit || 0) -
                            (user?.orgUsedStorage || 0)
                        )
                      )
                    : "—"}{" "}
                  left
                </span>
              </div>
            </div>

            {/* Org Path */}
            {user?.orgHierarchy?.length > 0 && (
              <div className="mt-7">
                <div className="text-xs text-gray-500 mb-1">Org Path 🌐</div>
                <div className="flex flex-wrap gap-2">
                  {user.orgHierarchy.map((o, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 rounded-full bg-white/60 border border-white/40 text-xs text-slate-700 shadow-sm"
                    >
                      ➡️ {o.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </motion.div>

          {/* ---------------------------------------------------------
             RIGHT — Main Section
          --------------------------------------------------------- */}
          <div className="lg:col-span-2 space-y-8">

            {/* Storage Overview */}
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45 }}
              className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl border border-white/40 p-7 hover:shadow-2xl transition"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-slate-800">
                    Organization Storage 💾
                  </h3>
                  <p className="text-sm text-gray-500">
                    Overview of usage and capacity
                  </p>
                </div>

                <div className="text-right text-sm text-gray-600">
                  <div className="text-xs">Limit</div>
                  <div className="font-semibold text-slate-800">
                    {user?.orgStorageLimit
                      ? formatBytes(user.orgStorageLimit)
                      : "5 GB"}
                  </div>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <InfoCard label="📁 Total Files" value={user?.orgTotalFiles ?? 0} color="from-indigo-100 to-indigo-200" />
                <InfoCard label="⬆️ Your Uploads" value={formatBytes(user?.totalUploadSize || 0)} color="from-violet-100 to-violet-200" />
                <InfoCard
                  label="⚡ Usage %"
                  value={
                    user?.orgStorageLimit
                      ? Math.min(
                          100,
                          Math.round(
                            ((user?.orgUsedStorage || 0) /
                              user.orgStorageLimit) *
                              100
                          )
                        )
                      : 0
                  }
                  color="from-teal-100 to-teal-200"
                />
              </div>
            </motion.div>

            {/* Requests */}
            <div className="space-y-6">
              {["superAdmin", "orgAdmin", "deptAdmin"].includes(user?.role) &&
                adminRequests.length > 0 && (
                  <RequestSection
                    title="Pending Admin Requests 📝"
                    color="slate"
                    requests={adminRequests}
                    respondToRequest={respondToRequest}
                  />
                )}

              {myRequests.length > 0 && (
                <RequestSection
                  title="My Pending Requests ⏳"
                  color="teal"
                  requests={myRequests}
                  respondToRequest={respondToRequest}
                />
              )}

              {adminRequests.length === 0 && myRequests.length === 0 && (
                <div className="bg-white/70 backdrop-blur-xl rounded-3xl border border-white/40 shadow p-6 text-center text-gray-600">
                  <h4 className="text-lg font-medium text-slate-800">
                    🎉 No pending requests
                  </h4>
                  <p className="text-sm mt-1">You're all caught up!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ---------------------------------------------------------
         EDIT PROFILE MODAL
      --------------------------------------------------------- */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setIsEditing(false)}
          />

          <motion.form
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            onSubmit={handleProfileUpdate}
            className="relative z-10 w-full max-w-2xl bg-white/80 backdrop-blur-xl border border-white/40 rounded-3xl shadow-xl p-7"
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold text-slate-800">
                  Edit Profile ✏️
                </h3>
                <p className="text-sm text-gray-500">
                  Update your name or photo
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <FaTimesCircle className="text-3xl" />
              </button>
            </div>

            <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-500">Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder={user?.name}
                  className="w-full mt-1 px-3 py-2 border border-white/40 bg-white/60 rounded-xl shadow-inner outline-none focus:ring-2 focus:ring-indigo-400 transition"
                />
              </div>

              <div>
                <label className="text-xs text-gray-500">Avatar</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setSelectedFile(e.target.files[0])}
                  className="w-full mt-1 text-sm text-gray-600"
                />
                {selectedFile && (
                  <p className="mt-1 text-xs text-gray-500">
                    {selectedFile.name}
                  </p>
                )}
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 rounded-xl text-sm border border-white/40 hover:bg-gray-50 transition"
              >
                Cancel
              </button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                type="submit"
                disabled={updating}
                className="px-5 py-2 bg-gradient-to-r from-indigo-500 to-violet-600 text-white rounded-xl shadow-md"
              >
                {updating ? "Updating..." : <><FaCheck /> Save</>}
              </motion.button>
            </div>
          </motion.form>
        </div>
      )}
    </div>
  );

  function formatBytes(bytes = 0) {
    if (!bytes) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  }
}

// -------------------------------------------------------------
// MINI COMPONENTS
// -------------------------------------------------------------
function StatCard({ title, value }) {
  return (
    <div className="bg-white/60 border border-white/40 p-4 rounded-2xl shadow-sm hover:shadow-md transition text-center">
      <div className="text-xs text-gray-500">{title}</div>
      <div className="text-xl font-semibold text-slate-800 mt-1">{value}</div>
    </div>
  );
}

function InfoCard({ label, value, color }) {
  return (
    <div
      className={`p-4 rounded-xl shadow-sm border border-white/50 bg-gradient-to-br ${color} hover:shadow-lg transition`}
    >
      <div className="text-xs text-gray-600">{label}</div>
      <div className="mt-2 text-lg font-semibold text-slate-800">{value}</div>
    </div>
  );
}

// -------------------------------------------------------------
// Requests Section
// -------------------------------------------------------------
export function RequestSection({
  title,
  color = "slate",
  requests = [],
  respondToRequest = () => {},
}) {
  const accent =
    color === "teal" ? "text-teal-700" : "text-slate-700";

  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl border border-white/40 p-6 hover:shadow-2xl transition"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className={`text-lg font-semibold ${accent}`}>{title}</h3>
        <span className="text-sm text-gray-500">
          {requests.length} pending
        </span>
      </div>

      <div className="space-y-4">
        {requests.map((r) => (
          <div
            key={r._id}
            className="p-4 bg-white/60 backdrop-blur-md border border-white/40 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-white/80 transition shadow-sm"
          >
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-slate-800">
                    {r.sender?.name} ✨
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {r.type} request for{" "}
                    <span className="font-medium">
                      {r.orgId?.name || r.departmentId?.name}
                    </span>
                  </div>
                </div>

                <div className="hidden sm:block text-xs text-gray-500">
                  {r.createdAt &&
                    new Date(r.createdAt).toLocaleString()}
                </div>
              </div>

              {r.message && (
                <div className="mt-2 text-xs text-gray-600 italic">
                  💬 {r.message}
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => respondToRequest(r._id, "approve")}
                className="px-3 py-1.5 bg-teal-600 text-white rounded-xl text-sm hover:bg-teal-500 transition inline-flex items-center gap-1"
              >
                <FaCheck /> Accept
              </button>

              <button
                onClick={() => respondToRequest(r._id, "reject")}
                className="px-3 py-1.5 bg-white/70 border border-white/40 text-slate-700 rounded-xl text-sm hover:bg-gray-50 transition inline-flex items-center gap-1"
              >
                <FaTimes /> Reject
              </button>
            </div>
          </div>
        ))}
      </div>
    </motion.section>
  );
}
