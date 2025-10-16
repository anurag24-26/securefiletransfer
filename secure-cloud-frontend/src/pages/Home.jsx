// Home.jsx
import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import api from "../services/api";
import { useNavigate } from "react-router-dom";
import Loader from "../components/Loader";
import { motion } from "framer-motion";
import bgImage from "../assets/back1.jpg";
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
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white px-4">
        <p className="text-red-400 text-lg mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="w-full sm:w-auto bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-600 hover:to-indigo-600 text-white px-6 py-3 rounded-2xl shadow-lg transition-all duration-300 transform hover:scale-105"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex flex-col justify-between bg-cover bg-center relative text-white"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <div className="absolute inset-0 bg-black/25" />

      <div className="relative z-10 flex-grow flex flex-col items-center pt-16 pb-10 px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9 }}
          className="w-full max-w-3xl sm:max-w-6xl p-6 sm:p-12 rounded-3xl bg-black/50 border border-white/20 backdrop-blur-sm shadow-2xl shadow-black/50"
        >
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 sm:mb-12 gap-5">
            <h1 className="text-3xl sm:text-5xl font-extrabold text-white drop-shadow-lg text-center sm:text-left">
              Welcome, {user?.name ?? "User"} 👋
            </h1>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsEditing(!isEditing)}
              className="flex items-center gap-2 w-full sm:w-auto justify-center bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-600 hover:to-indigo-600 px-5 py-3 rounded-full text-white font-semibold shadow-lg transition-all duration-300"
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

          {/* Profile Card */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8 sm:mb-12 bg-black/50 rounded-3xl border border-white/20 p-6 sm:p-8 shadow-lg shadow-black/50 hover:shadow-black/60 transition-all duration-300"
          >
            <h2 className="text-xl sm:text-2xl font-semibold text-white mb-4 sm:mb-6 drop-shadow-md text-center sm:text-left">My Profile</h2>
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">
              {user?.avatar ? (
                <img
                  src={`${api.defaults.baseURL.replace(/\/api$/, "")}${user.avatar}`}
                  alt="Avatar"
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover border-2 border-white shadow-md transition-all duration-300 hover:scale-105"
                  onError={(e) =>
                    (e.target.src =
                      "https://cdn-icons-png.flaticon.com/512/847/847969.png")
                  }
                />
              ) : (
                <FaUserCircle className="text-8xl sm:text-9xl text-gray-200 drop-shadow-md" />
              )}
              <div className="space-y-2 sm:space-y-3 text-white text-base sm:text-lg drop-shadow-sm text-center sm:text-left">
                <p><span className="font-semibold">Name:</span> {user?.name}</p>
                <p><span className="font-semibold">Email:</span> {user?.email}</p>
                <p><span className="font-semibold">Role:</span> {user?.role}</p>
              </div>
            </div>

            {user?.orgHierarchy?.length > 0 && (
              <div className="mt-4 sm:mt-6 flex flex-wrap justify-center sm:justify-start items-center gap-2 sm:gap-3">
                <span className="font-semibold text-blue-300">Organization:</span>
                {user.orgHierarchy.map((o, i) => (
                  <span
                    key={o._id || i}
                    className="px-3 py-1 bg-white/10 border border-white/25 rounded-full text-sm text-white shadow-inner hover:bg-blue-600/20 transition-all duration-300"
                  >
                    {o.name}
                  </span>
                ))}
              </div>
            )}
          </motion.section>

          {/* Edit Profile */}
          {isEditing && (
            <motion.form
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              onSubmit={handleProfileUpdate}
              className="mb-8 sm:mb-12 bg-black/50 p-6 sm:p-8 rounded-3xl border border-white/20 space-y-4 sm:space-y-6 shadow-inner shadow-black/50"
            >
              <h2 className="text-lg sm:text-xl font-semibold text-white flex items-center gap-2 drop-shadow-sm text-center sm:text-left">
                <FaEdit /> Edit Profile
              </h2>

              <div>
                <label className="block text-white mb-2 font-medium">Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Enter new name"
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-300"
                />
              </div>

              <div>
                <label className="block text-white mb-2 font-medium">Avatar</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setSelectedFile(e.target.files[0])}
                  className="w-full bg-white/10 border border-white/20 rounded-lg p-3 text-white file:mr-3 file:py-1 file:px-3 file:rounded-md file:border-0 file:bg-blue-600 file:text-white hover:file:bg-blue-700 transition-all duration-300"
                />
                {selectedFile && (
                  <p className="mt-2 text-sm text-blue-300 text-center sm:text-left">{selectedFile.name}</p>
                )}
              </div>

              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                type="submit"
                disabled={updating}
                className="w-full sm:w-auto flex items-center justify-center gap-3 bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-600 hover:to-indigo-600 px-6 py-3 rounded-xl text-white font-semibold shadow-lg transition-all duration-300"
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

const RequestSection = ({ title, color, requests, respondToRequest }) => {
  const accent = color === "indigo" ? "blue-300" : "teal-300";
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7 }}
      className="mb-6 sm:mb-10"
    >
      <h2 className={`text-lg sm:text-xl font-semibold text-${accent} mb-3 sm:mb-5 border-b border-white/25 pb-2 drop-shadow-sm text-center sm:text-left`}>
        {title}
      </h2>
      <div className="space-y-3 sm:space-y-4">
        {requests.map((r) => (
          <motion.div
            key={r._id}
            whileHover={{ scale: 1.02 }}
            className="p-4 sm:p-5 bg-black/50 border border-white/20 rounded-2xl shadow-md flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 hover:shadow-black/60 transition-all duration-300"
          >
            <div className="text-white text-sm sm:text-base flex-1">
              <p>
                <strong className="text-blue-300">{r.sender?.name || "Someone"}</strong> sent a{" "}
                <span className="capitalize text-blue-300">{r.type}</span> request for{" "}
                <strong className="text-blue-300">
                  {r.orgId?.name || r.departmentId?.name || "Organization"}
                </strong>
              </p>
              {r.message && (
                <p className="italic text-xs sm:text-sm text-gray-200 mt-1">{r.message}</p>
              )}
            </div>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto mt-2 sm:mt-0">
              <button
                onClick={() => respondToRequest(r._id, "approve")}
                className="flex-1 sm:flex-auto bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded-lg shadow-md transition-all duration-300 transform hover:scale-105"
              >
                Accept
              </button>
              <button
                onClick={() => respondToRequest(r._id, "reject")}
                className="flex-1 sm:flex-auto bg-rose-500 hover:bg-rose-600 text-white px-4 py-2 rounded-lg shadow-md transition-all duration-300 transform hover:scale-105"
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
