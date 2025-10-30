// Home.jsx — Ultra-Modern Glassmorphic Dashboard (Dark Blue Info + Purple Edit Box)
import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import api from "../services/api";
import { useNavigate } from "react-router-dom";
import Loader from "../components/Loader";
import { motion } from "framer-motion";
import bgImage from "../assets/back2.jpg";
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
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center py-14 px-3 sm:px-6 relative overflow-auto"
      style={{
        backgroundImage: `url(${bgImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    >
      {/* Subtle overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/55 via-slate-900/40 to-black/50 backdrop-blur-[2px]" />

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 w-full max-w-6xl rounded-[2.5rem] bg-white/5 backdrop-blur-xl border border-white/20 shadow-[0_25px_60px_rgba(0,0,0,0.4)] p-8 sm:p-14"
      >
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-10 text-center sm:text-left">
          <h1 className="text-4xl sm:text-6xl font-extrabold text-white drop-shadow-[0_3px_8px_rgba(0,0,0,0.6)]">
            Welcome, {user?.name ?? "User"}{" "}
            <span className="inline-block animate-wave text-[2.5rem] sm:text-[3rem]">
              👋🏽
            </span>
          </h1>
          <motion.button
            whileHover={{ scale: 1.07 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsEditing(!isEditing)}
            className="mt-5 sm:mt-0 flex items-center gap-2 bg-gradient-to-r from-indigo-500 via-purple-600 to-blue-600 text-white px-6 py-3 rounded-full font-medium shadow-md hover:shadow-purple-400/40 transition-all text-base sm:text-lg"
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

        {/* Profile Box */}
        <motion.div
          whileHover={{ scale: 1.01 }}
          className="rounded-3xl border border-white/20 bg-white/10 backdrop-blur-2xl p-8 sm:p-12 shadow-md hover:shadow-indigo-400/30 transition-all mb-10"
        >
          <div className="flex flex-col sm:flex-row items-center gap-8 sm:gap-10">
            {user?.avatar ? (
              <img
                src={`${api.defaults.baseURL.replace(/\/api$/, "")}${user.avatar}`}
                alt="Avatar"
                className="w-32 h-32 sm:w-44 sm:h-44 rounded-full object-cover border-4 border-white/40 shadow-lg"
              />
            ) : (
              <FaUserCircle className="text-9xl sm:text-[11rem] text-indigo-200 drop-shadow-md" />
            )}

            <div className="text-white text-lg sm:text-xl space-y-3 sm:space-y-4 text-center sm:text-left leading-relaxed">
              <p>
                <span className="font-semibold text-blue-300">Name:</span>{" "}
                <span className="text-blue-100">{user?.name}</span>
              </p>
              <p>
                <span className="font-semibold text-blue-300">Email:</span>{" "}
                <span className="text-blue-100">{user?.email}</span>
              </p>
              <p>
                <span className="font-semibold text-blue-300">Role:</span>{" "}
                <span className="text-blue-100">{user?.role}</span>
              </p>

              {user?.orgHierarchy?.length > 0 && (
                <div className="flex flex-wrap justify-center sm:justify-start gap-3 mt-3">
                  <span className="font-semibold text-blue-300">Organization:</span>
                  {user.orgHierarchy.map((o, i) => (
                    <span
                      key={o._id || i}
                      className="px-4 py-1.5 bg-gradient-to-r from-blue-900/60 to-indigo-800/60 border border-white/20 rounded-full text-sm sm:text-base text-white shadow-inner hover:bg-indigo-700/40 transition-all"
                    >
                      {o.name}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Edit Profile Form */}
        {isEditing && (
          <motion.form
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            onSubmit={handleProfileUpdate}
            className="bg-gradient-to-br from-purple-900/60 via-indigo-900/50 to-blue-900/60 backdrop-blur-2xl rounded-3xl p-8 sm:p-12 border border-white/20 shadow-xl space-y-6 mb-12"
          >
            <h2 className="text-2xl sm:text-3xl font-semibold text-white flex items-center gap-2">
              <FaEdit /> Edit Profile
            </h2>

            <div>
              <label className="block text-blue-200 mb-2 font-medium text-lg">
                Name
              </label>
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Enter new name"
                className="w-full px-5 py-4 bg-white/15 border border-white/25 rounded-lg text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition text-lg"
              />
            </div>

            <div>
              <label className="block text-blue-200 mb-2 font-medium text-lg">
                Avatar
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setSelectedFile(e.target.files[0])}
                className="w-full bg-white/15 border border-white/25 rounded-lg p-4 text-white file:mr-3 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-indigo-700 file:text-white hover:file:bg-indigo-800 transition"
              />
              {selectedFile && (
                <p className="mt-2 text-sm text-indigo-300">{selectedFile.name}</p>
              )}
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              type="submit"
              disabled={updating}
              className="w-full bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 text-white font-semibold py-4 rounded-full shadow-lg hover:shadow-indigo-400/40 transition-all text-lg"
            >
              {updating ? "Updating..." : "Save Changes"}
            </motion.button>
          </motion.form>
        )}

        {/* Requests */}
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
  );
};

// Request Section
const RequestSection = ({ title, color, requests, respondToRequest }) => {
  const accent =
    color === "indigo"
      ? "from-indigo-200 to-blue-200"
      : "from-teal-200 to-emerald-200";

  return (
    <motion.section
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7 }}
      className="mt-10"
    >
      <h2
        className={`text-2xl sm:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r ${accent} mb-6`}
      >
        {title}
      </h2>
      <div className="space-y-5 sm:space-y-6">
        {requests.map((r) => (
          <motion.div
            key={r._id}
            whileHover={{ scale: 1.02 }}
            className="p-6 sm:p-8 bg-white/10 border border-white/20 rounded-3xl shadow-md hover:shadow-indigo-400/30 transition-all backdrop-blur-2xl flex flex-col sm:flex-row justify-between gap-5"
          >
            <div className="text-white text-base sm:text-lg flex-1 leading-relaxed">
              <p>
                <strong className="text-indigo-200">{r.sender?.name}</strong> sent a{" "}
                <span className="capitalize text-indigo-200">{r.type}</span> request for{" "}
                <strong className="text-indigo-200">
                  {r.orgId?.name || r.departmentId?.name}
                </strong>
              </p>
              {r.message && (
                <p className="italic text-sm sm:text-base text-gray-200 mt-2">
                  {r.message}
                </p>
              )}
            </div>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <button
                onClick={() => respondToRequest(r._id, "approve")}
                className="bg-gradient-to-r from-teal-500 to-indigo-500 hover:from-indigo-500 hover:to-teal-500 text-white px-6 py-3 rounded-xl shadow-md transition-all text-base"
              >
                Accept
              </button>
              <button
                onClick={() => respondToRequest(r._id, "reject")}
                className="bg-gradient-to-r from-pink-500 to-red-500 hover:from-red-600 hover:to-pink-600 text-white px-6 py-3 rounded-xl shadow-md transition-all text-base"
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
