import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import api from "../services/api";
import { useNavigate } from "react-router-dom";
import Loader from "../components/Loader";
import { motion } from "framer-motion";
import bgImage from "../assets/Back2.jpg";
import { FaEdit, FaTimes, FaUserCircle } from "react-icons/fa";

const Home = () => {
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

        if (
          ["superAdmin", "orgAdmin", "deptAdmin"].includes(userData.user.role)
        ) {
          const { data: adminReqData } = await api.get("/requests", {
            headers: { Authorization: `Bearer ${token}` },
          });
          setAdminRequests(adminReqData.requests || []);
        }

        const { data: myReqData } = await api.get("/requests/my-requests", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMyRequests(myReqData.requests || []);
      } catch {
        setError("Session expired. Please login again.");
        logout();
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token, setUser, logout, navigate]);

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
      alert(err?.response?.data?.message || "Failed to respond. Try again.");
    }
  };

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
      alert("Profile updated successfully!");
      setIsEditing(false);
      setEditName("");
      setSelectedFile(null);
    } catch (err) {
      alert(err?.response?.data?.message || "Update failed. Try again.");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <Loader />;
  if (error)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white px-4">
        <p className="text-red-400 text-lg mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-600 hover:to-indigo-600 text-white px-6 py-3 rounded-2xl shadow-lg transition-all duration-300 transform hover:scale-105"
        >
          Retry
        </button>
      </div>
    );

  return (
    <div
      className="min-h-screen flex items-center justify-center py-10 px-2 sm:px-4 bg-fixed relative"
      style={{
        backgroundImage: `url(${bgImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/55 via-slate-900/40 to-black/50 backdrop-blur-[2px] z-0" />
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="relative z-10 w-full max-w-4xl rounded-2xl bg-white/5 border border-white/10 shadow-xl p-4 sm:p-8 mx-auto"
      >
        {/* Header */}
        <header className="flex flex-col md:flex-row items-center justify-between gap-6 mb-6">
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-2xl sm:text-4xl font-bold text-white">
              Welcome, {user?.name ?? "User"}
              <span className="ml-2 text-xl sm:text-2xl">👋</span>
            </h1>
            <p className="mt-1 text-sm text-blue-200/80">
              Here’s a summary of your organization and storage.
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setIsEditing((prev) => !prev)}
            className="flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-blue-600 text-white px-4 py-2 rounded-full shadow text-sm"
          >
            {isEditing ? (
              <>
                <FaTimes /> Cancel
              </>
            ) : (
              <>
                <FaEdit /> Edit Profile
              </>
            )}
          </motion.button>
        </header>
        {/* Responsive Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
          {/* Profile Card */}
          <motion.section
            whileHover={{ scale: 1.01 }}
            className="rounded-xl bg-white/10 border border-white/10 shadow-md p-5 flex flex-col items-center md:items-start"
          >
            <div className="flex items-center gap-4 mb-3">
              {user?.avatar ? (
                <img
                  src={user?.avatar}
                  alt="avatar"
                  className="w-20 h-20 sm:w-28 sm:h-28 rounded-full object-cover border-2 border-white/20"
                />
              ) : (
                <FaUserCircle className="text-indigo-200 text-6xl sm:text-7xl" />
              )}
              <div className="flex-1 text-center md:text-left">
                <h2 className="text-lg font-semibold text-white">{user?.name}</h2>
                <p className="text-xs text-blue-200">{user?.email}</p>
                <div className="flex flex-wrap gap-2 mt-3 justify-center md:justify-start">
                  <span className="px-3 py-1 bg-indigo-700/50 text-white text-xs rounded-full border border-white/10">
                    {user?.role ?? "—"}
                  </span>
                  {user?.org?.name && (
                    <span className="px-3 py-1 bg-blue-600/40 text-white text-xs rounded-full border border-white/10">
                      {user?.org.name}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="w-full grid grid-cols-2 gap-2">
              <div className="bg-white/10 p-2 rounded-lg text-center">
                <div className="text-xs text-blue-200">Users</div>
                <div className="text-white font-medium">
                  {user?.orgTotalUsers ?? 0}
                </div>
              </div>
              <div className="bg-white/10 p-2 rounded-lg text-center">
                <div className="text-xs text-blue-200">Files</div>
                <div className="text-white font-medium">
                  {user?.orgTotalFiles ?? 0}
                </div>
              </div>
            </div>
          </motion.section>
          {/* Storage Card */}
          <motion.section
            whileHover={{ scale: 1.01 }}
            className="md:col-span-2 rounded-xl bg-gradient-to-br from-blue-900/30 to-indigo-900/20 border border-white/10 shadow-md p-5 flex flex-col justify-between"
          >
            <h2 className="text-lg font-semibold text-white mb-2">
              Organization Storage
            </h2>
            <div className="flex flex-wrap justify-between gap-2 items-center mb-3">
              <div className="text-sm text-blue-200">Limit</div>
              <div className="font-medium text-white">
                {user?.orgStorageLimit
                  ? formatBytes(user.orgStorageLimit)
                  : "5 GB"}
              </div>
            </div>
            {/* Progress Bar */}
            <div className="w-full bg-white/10 rounded-full h-3 mb-4 relative">
              <div
                className="h-3 rounded-full bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 transition-all duration-700"
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
            <div className="flex flex-wrap justify-between items-center gap-2 text-xs text-blue-200 mb-2">
              <div>
                <span>Used</span>
                <div className="font-medium text-white">
                  {formatBytes(user?.orgUsedStorage || 0)}
                </div>
              </div>
              <div>
                <span>Remaining</span>
                <div className="font-medium text-white">
                  {user?.orgStorageLimit
                    ? formatBytes(
                        Math.max(
                          0,
                          (user?.orgStorageLimit || 0) -
                            (user?.orgUsedStorage || 0)
                        )
                      )
                    : "—"}
                </div>
              </div>
              <div>
                <span>Usage</span>
                <div className="font-medium text-white">
                  {user?.orgStorageLimit
                    ? Math.min(
                        100,
                        Math.round(
                          ((user?.orgUsedStorage || 0) /
                            user.orgStorageLimit) *
                            100
                        )
                      )
                    : 0}
                  %
                </div>
              </div>
            </div>
            {/* Extra stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div className="bg-white/10 p-2 rounded-lg text-center">
                <div className="text-xs text-blue-200">Total Files</div>
                <div className="text-white font-medium">
                  {user?.orgTotalFiles ?? 0}
                </div>
              </div>
              <div className="bg-white/10 p-2 rounded-lg text-center">
                <div className="text-xs text-blue-200">Your Upload Size</div>
                <div className="text-white font-medium">
                  {formatBytes(user?.totalUploadSize || 0)}
                </div>
              </div>
              <div className="bg-white/10 p-2 rounded-lg text-center">
                <div className="text-xs text-blue-200">Last Updated</div>
                <div className="text-white font-medium">
                  {user?.lastUploadAt
                    ? new Date(user.lastUploadAt).toLocaleString()
                    : "—"}
                </div>
              </div>
            </div>
            {/* Organization Hierarchy */}
            {user?.orgHierarchy?.length > 0 && (
              <div className="mt-3">
                <span className="text-xs text-blue-200">
                  Organization Path
                </span>
                <div className="flex flex-wrap gap-2 mt-2">
                  {user.orgHierarchy.map((o, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 bg-white/10 border border-white/6 rounded-full text-xs text-white"
                    >
                      {o.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </motion.section>
        </div>
        {/* Edit Profile Form */}
        {isEditing && (
          <motion.form
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.32 }}
            onSubmit={handleProfileUpdate}
            className="mb-8 w-full bg-gradient-to-br from-purple-900/30 to-indigo-900/30 border border-white/10 rounded-xl p-6 shadow-lg"
          >
            <h3 className="text-base sm:text-lg font-semibold text-white mb-3">
              Edit Profile
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
              <div>
                <label className="block text-xs text-blue-200 mb-1">Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Enter new name"
                  className="w-full px-3 py-2 bg-white/10 border border-white/10 rounded-md text-white placeholder-blue-200 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs text-blue-200 mb-1">
                  Avatar
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setSelectedFile(e.target.files[0])}
                  className="w-full px-2 py-2 bg-white/10 border border-white/10 rounded-md text-white file:bg-indigo-700 file:text-white file:rounded-md"
                />
                {selectedFile && (
                  <p className="mt-1 text-xs text-indigo-200">
                    {selectedFile.name}
                  </p>
                )}
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={updating}
              className="px-6 py-2 bg-gradient-to-r from-indigo-500 to-blue-600 text-white rounded-full font-semibold shadow mt-2"
            >
              {updating ? "Updating..." : "Save Changes"}
            </motion.button>
          </motion.form>
        )}
        {/* Requests */}
        <div className="mt-4 mb-2 space-y-4">
          {["superAdmin", "orgAdmin", "deptAdmin"].includes(user?.role) &&
            adminRequests.length > 0 && (
              <RequestSection
                title="Pending Admin Requests"
                color="indigo"
                requests={adminRequests}
                respondToRequest={respondToRequest}
              />
            )}
          {myRequests.length > 0 && (
            <RequestSection
              title="My Pending Requests"
              color="teal"
              requests={myRequests}
              respondToRequest={respondToRequest}
            />
          )}
        </div>
      </motion.div>
    </div>
  );

  function formatBytes(bytes = 0) {
    if (!bytes || bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  }
};

const RequestSection = ({ title, color, requests, respondToRequest }) => {
  const accent =
    color === "indigo"
      ? "from-indigo-200 to-blue-200"
      : "from-teal-200 to-emerald-200";
  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full"
    >
      <h2
        className={`text-xl sm:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r ${accent} mb-3`}
      >
        {title}
      </h2>
      <div className="space-y-3">
        {requests.map((r) => (
          <motion.div
            key={r._id}
            whileHover={{ scale: 1.01 }}
            className="p-4 bg-white/10 border border-white/10 rounded-xl shadow-sm flex flex-col sm:flex-row justify-between gap-2 items-center"
          >
            <div className="flex-1 flex flex-col text-white">
              <span className="font-semibold text-indigo-200">
                {r.sender?.name}
              </span>
              <span className="text-xs mt-1 text-blue-200">
                <span className="capitalize">{r.type}</span> request for{" "}
                <span className="font-medium text-white">
                  {r.orgId?.name || r.departmentId?.name}
                </span>
              </span>
              {r.message && (
                <span className="mt-2 text-xs italic text-gray-200">
                  {r.message}
                </span>
              )}
            </div>
            <div className="flex gap-2 mt-2 sm:mt-0">
              <button
                onClick={() => respondToRequest(r._id, "approve")}
                className="px-4 py-1 sm:py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-lg shadow text-xs sm:text-sm"
              >
                Accept
              </button>
              <button
                onClick={() => respondToRequest(r._id, "reject")}
                className="px-4 py-1 sm:py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg shadow text-xs sm:text-sm"
              >
                Reject
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
};

export default Home;
