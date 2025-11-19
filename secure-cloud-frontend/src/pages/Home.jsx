import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import api from "../services/api";
import { useNavigate } from "react-router-dom";
import Loader from "../components/Loader";
import { motion } from "framer-motion";
import { FaEdit, FaTimes, FaUserCircle, FaCheck, FaTimesCircle, FaUpload, FaFolder } from "react-icons/fa";

// Premium Light Dashboard — Home.jsx
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

  if (loading) return <Loader />;

  if (error)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-gray-900 px-4">
        <div className="max-w-lg w-full bg-white shadow-xl rounded-xl p-6 text-center border border-gray-100">
          <h3 className="text-lg font-semibold mb-2">⚠️ Session Error</h3>
          <p className="text-sm text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center justify-center px-5 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-md shadow-lg hover:from-indigo-600 hover:to-purple-700 transition"
          >
            🔄 Retry
          </button>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

          {/* Left column - Profile Card */}
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6 hover:shadow-2xl transition"
          >
            <div className="flex items-center gap-4">
              <div className="h-24 w-24 flex items-center justify-center rounded-full bg-gradient-to-tr from-indigo-100 to-purple-100 overflow-hidden border border-gray-200">
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt="avatar"
                    className="object-cover h-full w-full"
                  />
                ) : (
                  <FaUserCircle className="text-gray-400 text-6xl" />
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-semibold text-slate-800">{user?.name} ✨</h2>
                    <p className="text-sm text-gray-500">{user?.email}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <span className="inline-flex items-center px-3 py-1 rounded-full bg-slate-100 text-sm text-slate-700 border border-gray-100">
                        {user?.role ?? '—'}
                      </span>
                      {user?.org?.name && (
                        <span className="inline-flex items-center px-3 py-1 rounded-full bg-white text-sm text-slate-600 border border-gray-100">
                          🏢 {user.org.name}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setIsEditing(true)}
                      className="inline-flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-2xl text-sm shadow-lg hover:from-indigo-600 hover:to-purple-700 transition"
                    >
                      <FaEdit /> Edit
                    </motion.button>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <div className="bg-slate-50 border border-gray-100 rounded-xl p-3 text-center hover:bg-indigo-50 transition">
                <div className="text-xs text-gray-500">👥 Users</div>
                <div className="text-sm font-medium text-slate-800">{user?.orgTotalUsers ?? 0}</div>
              </div>
              <div className="bg-slate-50 border border-gray-100 rounded-xl p-3 text-center hover:bg-purple-50 transition">
                <div className="text-xs text-gray-500">📁 Files</div>
                <div className="text-sm font-medium text-slate-800">{user?.orgTotalFiles ?? 0}</div>
              </div>
            </div>

            <div className="mt-6 text-sm text-gray-600">
              <div className="flex items-center justify-between">
                <span>Last Upload 📤</span>
                <span className="font-medium text-slate-800 text-sm">{user?.lastUploadAt ? new Date(user.lastUploadAt).toLocaleString() : '—'}</span>
              </div>
              <div className="mt-3">
                <span className="block text-xs text-gray-500 mb-1">Storage Usage</span>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div
                    className="h-2 rounded-full transition-all duration-500"
                    style={{
                      width: `${user?.orgStorageLimit ? Math.min(100, Math.round(((user?.orgUsedStorage || 0) / user.orgStorageLimit) * 100)) : 0}%`,
                      background: 'linear-gradient(90deg,#6366f1,#8b5cf6)'
                    }}
                  />
                </div>
                <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
                  <span>{formatBytes(user?.orgUsedStorage || 0)} used</span>
                  <span>{user?.orgStorageLimit ? formatBytes(Math.max(0, (user?.orgStorageLimit || 0) - (user?.orgUsedStorage || 0))) : '—'} remaining</span>
                </div>
              </div>
            </div>

            {user?.orgHierarchy?.length > 0 && (
              <div className="mt-6">
                <div className="text-xs text-gray-500 mb-2">Org Path 🌐</div>
                <div className="flex flex-wrap gap-2">
                  {user.orgHierarchy.map((o, i) => (
                    <span key={i} className="px-3 py-1 bg-white border border-gray-100 rounded-full text-xs text-slate-700 hover:bg-indigo-50 transition">➡️ {o.name}</span>
                  ))}
                </div>
              </div>
            )}
          </motion.div>

          {/* Right column - Main content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Storage Card */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.05 }}
              className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6 hover:shadow-2xl transition"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-slate-800">Organization Storage 💾</h3>
                  <p className="text-sm text-gray-500">Overview of storage & usage</p>
                </div>
                <div className="text-sm text-gray-600">
                  <div className="text-xs">Limit</div>
                  <div className="font-medium text-slate-800">{user?.orgStorageLimit ? formatBytes(user.orgStorageLimit) : '5 GB'}</div>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="rounded-xl bg-indigo-50 p-4 border border-gray-100 hover:shadow-lg transition">
                  <div className="text-xs text-gray-500">📁 Total Files</div>
                  <div className="mt-2 text-lg font-semibold text-slate-800">{user?.orgTotalFiles ?? 0}</div>
                </div>
                <div className="rounded-xl bg-purple-50 p-4 border border-gray-100 hover:shadow-lg transition">
                  <div className="text-xs text-gray-500">⬆️ Your Upload</div>
                  <div className="mt-2 text-lg font-semibold text-slate-800">{formatBytes(user?.totalUploadSize || 0)}</div>
                </div>
                <div className="rounded-xl bg-teal-50 p-4 border border-gray-100 hover:shadow-lg transition">
                  <div className="text-xs text-gray-500">⚡ Usage %</div>
                  <div className="mt-2 text-lg font-semibold text-slate-800">{user?.orgStorageLimit ? Math.min(100, Math.round(((user?.orgUsedStorage || 0) / user.orgStorageLimit) * 100)) : 0}%</div>
                </div>
              </div>
            </motion.div>

            {/* Requests Section */}
            <div className="grid grid-cols-1 gap-6">
              {(["superAdmin", "orgAdmin", "deptAdmin"].includes(user?.role) && adminRequests.length > 0) && (
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
                <div className="bg-white rounded-3xl border border-gray-100 p-6 text-center text-gray-600 hover:shadow-lg transition">
                  <h4 className="text-lg font-medium text-slate-800">🎉 No pending requests</h4>
                  <p className="text-sm mt-2">You're all caught up!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsEditing(false)} />
          <motion.form
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            onSubmit={handleProfileUpdate}
            className="relative z-10 w-full max-w-2xl bg-white rounded-3xl shadow-xl border border-gray-100 p-6"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-slate-800">Edit Profile ✏️</h3>
                <p className="text-sm text-gray-500 mt-1">Update your name or avatar</p>
              </div>
              <button type="button" onClick={() => setIsEditing(false)} className="text-gray-400 hover:text-gray-600">
                <FaTimesCircle className="text-2xl"/>
              </button>
            </div>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder={user?.name}
                  className="w-full px-3 py-2 border border-gray-100 rounded-xl bg-gray-50 text-slate-800 outline-none focus:ring-2 focus:ring-indigo-400 transition"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-500 mb-1">Avatar</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setSelectedFile(e.target.files[0])}
                  className="w-full text-sm text-gray-600"
                />
                {selectedFile && <p className="mt-2 text-xs text-gray-600">{selectedFile.name}</p>}
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button type="button" onClick={() => setIsEditing(false)} className="px-4 py-2 rounded-xl text-sm border border-gray-100">Cancel</button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={updating}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-sm shadow-lg transition"
              >
                {updating ? 'Updating...' : (<><FaCheck /> Save</>)}
              </motion.button>
            </div>
          </motion.form>
        </div>
      )}
    </div>
  );

  function formatBytes(bytes = 0) {
    if (!bytes || bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  }
}

// RequestSection component
export function RequestSection({ title, color = 'slate', requests = [], respondToRequest = () => {} }) {
  const accent = color === 'teal' ? 'text-teal-600' : 'text-slate-700';

  return (
    <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="bg-white rounded-3xl border border-gray-100 p-6 shadow hover:shadow-xl transition">
      <div className="flex items-center justify-between mb-4">
        <h3 className={`text-lg font-semibold ${accent}`}>{title}</h3>
        <span className="text-sm text-gray-500">{requests.length} pending</span>
      </div>

      <div className="space-y-3">
        {requests.map((r) => (
          <div key={r._id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-gray-50 border border-gray-100 rounded-xl p-4 hover:bg-white transition shadow-sm">
            <div className="flex-1 w-full">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-sm font-medium text-slate-800">{r.sender?.name} ✨</div>
                  <div className="text-xs text-gray-500 mt-1">
                    <span className="capitalize">{r.type}</span> request for <span className="font-medium text-slate-700">{r.orgId?.name || r.departmentId?.name}</span>
                  </div>
                </div>
                <div className="hidden sm:block text-xs text-gray-500">{r.createdAt ? new Date(r.createdAt).toLocaleString() : ''}</div>
              </div>

              {r.message && <div className="mt-2 text-xs text-gray-600 italic">💬 {r.message}</div>}
            </div>

            <div className="flex-shrink-0 flex items-center gap-2 mt-2 sm:mt-0">
              <button onClick={() => respondToRequest(r._id, 'approve')} className="inline-flex items-center gap-2 px-3 py-1.5 bg-teal-600 text-white rounded-2xl text-sm hover:bg-teal-500 transition"><FaCheck /> Accept</button>
              <button onClick={() => respondToRequest(r._id, 'reject')} className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 text-slate-700 rounded-2xl text-sm hover:bg-gray-50 transition"><FaTimes /> Reject</button>
            </div>
          </div>
        ))}
      </div>
    </motion.section>
  );
}
