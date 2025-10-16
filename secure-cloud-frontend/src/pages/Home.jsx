// Home.jsx
import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import api from "../services/api";
import { useNavigate } from "react-router-dom";
import Loader from "../components/Loader";
import { motion } from "framer-motion";
import bgImage from "../assets/bg.jpg";
import { FaEdit, FaSave, FaTimes, FaUserCircle } from "react-icons/fa";

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

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-gray-200">
        <p className="text-red-400 text-lg mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="bg-gradient-to-r from-teal-600 to-indigo-600 hover:from-teal-500 hover:to-indigo-500 text-white px-5 py-2 rounded-xl shadow-lg transition-all duration-300"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex flex-col justify-between bg-cover bg-center relative text-gray-100"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950/90 via-slate-900/80 to-slate-950/90 backdrop-blur-sm" />

      <div className="relative z-10 flex-grow flex items-start justify-center pt-16 pb-10">
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-5xl w-full p-10 rounded-3xl bg-slate-900/75 border border-slate-700 backdrop-blur-xl shadow-2xl shadow-teal-500/10"
        >
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-4xl font-extrabold bg-gradient-to-r from-teal-400 to-indigo-500 bg-clip-text text-transparent">
              Welcome, {user?.name ?? "User"} 👋
            </h1>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsEditing(!isEditing)}
              className="flex items-center gap-2 bg-gradient-to-r from-teal-600 to-indigo-600 hover:from-teal-500 hover:to-indigo-500 px-5 py-2 rounded-full text-white font-medium shadow-md transition-all duration-300"
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
          </div>

          {/* User Profile Card */}
          <motion.section
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-10 bg-slate-800/60 rounded-2xl border border-slate-700 p-6 shadow-lg shadow-teal-500/5"
          >
            <h2 className="text-xl font-semibold text-teal-400 mb-5">My Profile</h2>
            <div className="flex flex-wrap items-center gap-6">
              {user?.avatar ? (
                <img
                  src={`${api.defaults.baseURL.replace(/\/api$/, "")}${user.avatar}`}
                  alt="Avatar"
                  className="w-24 h-24 rounded-full object-cover border-2 border-teal-500 shadow-lg"
                  onError={(e) =>
                    (e.target.src =
                      "https://cdn-icons-png.flaticon.com/512/847/847969.png")
                  }
                />
              ) : (
                <FaUserCircle className="text-8xl text-gray-500" />
              )}
              <div className="space-y-1 text-gray-200">
                <p><strong>Name:</strong> {user?.name}</p>
                <p><strong>Email:</strong> {user?.email}</p>
                <p><strong>Role:</strong> {user?.role}</p>
              </div>
            </div>

            {user?.orgHierarchy?.length > 0 && (
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <strong className="text-teal-400">Organization:</strong>
                {user.orgHierarchy.map((o, i) => (
                  <span
                    key={o._id || i}
                    className="px-3 py-1 bg-slate-900/70 border border-slate-700 rounded-lg text-sm text-gray-100 shadow-inner hover:bg-teal-700/20 transition-all"
                  >
                    {o.name}
                  </span>
                ))}
              </div>
            )}
          </motion.section>

          {/* Edit Profile Section */}
          {isEditing && (
            <motion.form
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              onSubmit={handleProfileUpdate}
              className="mb-10 bg-slate-800/70 p-6 rounded-2xl border border-slate-700 space-y-5 shadow-inner shadow-teal-500/10"
            >
              <h2 className="text-lg font-semibold text-teal-300 flex items-center gap-2">
                <FaEdit /> Edit Profile
              </h2>

              <div>
                <label className="block text-gray-300 mb-1">Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Enter new name"
                  className="w-full px-4 py-2 bg-slate-900/70 border border-slate-600 rounded-md text-gray-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-gray-300 mb-1">Avatar</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setSelectedFile(e.target.files[0])}
                  className="w-full bg-slate-900/70 border border-slate-600 rounded-md p-2 text-gray-200 file:mr-3 file:py-1 file:px-3 file:rounded-md file:border-0 file:bg-teal-600 file:text-white hover:file:bg-teal-700 transition"
                />
              </div>

              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                type="submit"
                disabled={updating}
                className="flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 px-5 py-2 rounded-lg text-white font-medium shadow-md transition-all duration-300"
              >
                {updating ? "Updating..." : (<><FaSave /> Save Changes</>)}
              </motion.button>
            </motion.form>
          )}

          {/* Requests Sections */}
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
        </motion.div>
      </div>
    </div>
  );
};

// Reusable Request Section
const RequestSection = ({ title, color, requests, respondToRequest }) => {
  const accent = color === "indigo" ? "indigo-400" : "teal-400";
  return (
    <motion.section
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="mb-10"
    >
      <h2
        className={`text-xl font-semibold text-${accent} mb-5 border-b border-slate-700 pb-2`}
      >
        {title}
      </h2>
      <div className="space-y-4">
        {requests.map((r) => (
          <motion.div
            key={r._id}
            whileHover={{ scale: 1.02 }}
            className="p-4 bg-slate-800/60 border border-slate-700 rounded-2xl shadow-md flex justify-between items-center hover:shadow-teal-500/20 transition-all duration-300"
          >
            <div className="text-gray-200">
              <p>
                <strong>{r.sender?.name || "Someone"}</strong> sent you a{" "}
                <span className="capitalize text-teal-300">{r.type}</span> request for{" "}
                <strong className="text-teal-300">
                  {r.orgId?.name || r.departmentId?.name || "Organization"}
                </strong>
              </p>
              {r.message && (
                <p className="italic text-sm text-gray-400 mt-1">{r.message}</p>
              )}
            </div>
            <div className="space-x-3">
              <button
                onClick={() => respondToRequest(r._id, "approve")}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-1.5 rounded-lg shadow-md transition-all"
              >
                Accept
              </button>
              <button
                onClick={() => respondToRequest(r._id, "reject")}
                className="bg-rose-600 hover:bg-rose-700 text-white px-4 py-1.5 rounded-lg shadow-md transition-all"
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
