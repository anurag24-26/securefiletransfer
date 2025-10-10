import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import api from "../services/api";
import { useNavigate } from "react-router-dom";
import Loader from "../components/Loader";
import bgImage from "../assets/bg.jpg";
import { FaEdit, FaSave, FaTimes, FaUserCircle, FaUpload } from "react-icons/fa";

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

    const fetchUserAndRequests = async () => {
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
        } else {
          setAdminRequests([]);
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

    fetchUserAndRequests();
  }, [token, setUser, logout, navigate]);

  // Respond to requests (Approve / Reject)
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

      if (action === "approve" && data.user) {
        setUser(data.user);
      }
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to respond. Try again.");
    }
  };

  // Handle profile update
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
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
        <p className="text-red-500 text-lg mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex flex-col justify-between bg-cover bg-center relative"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-[4px]" />

      {/* Main content */}
      <div className="relative z-10 flex-grow flex items-start justify-center pt-16">
        <div className="max-w-4xl w-full p-8 rounded-3xl
                        bg-gradient-to-br from-slate-900/90 via-slate-800/80 to-slate-900/90
                        border border-white/10 backdrop-blur-md shadow-xl text-gray-100">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-extrabold drop-shadow-md">
              Welcome, {user?.name ?? "User"} 👋
            </h1>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="flex items-center gap-2 bg-cyan-600 hover:bg-cyan-700 px-4 py-2 rounded-full text-white shadow-md hover:shadow-cyan-500/30 transition-all duration-200"
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
            </button>
          </div>

          {/* User Details */}
          <section className="mb-10">
            <h2 className="text-xl font-semibold text-cyan-400 mb-4 border-b border-gray-700 pb-2">
              My Details
            </h2>

            <div className="flex items-center gap-6 mb-4">
            {user?.avatar ? (
  <img
    src={`${api.defaults.baseURL.replace(/\/api$/, "")}${user.avatar}`}
    alt="Avatar"
    className="w-20 h-20 rounded-full object-cover border-2 border-cyan-500"
    onError={(e) => {
      e.target.src = "https://cdn-icons-png.flaticon.com/512/847/847969.png"; // fallback avatar
    }}
  />
) : (
  <FaUserCircle className="text-7xl text-gray-400" />
)}

              <div>
                <p><strong>Name:</strong> {user?.name}</p>
                <p><strong>Email:</strong> {user?.email}</p>
                <p><strong>Role:</strong> {user?.role}</p>
              </div>
            </div>

            {/* Organization */}
            <p className="flex flex-wrap items-center gap-1 text-gray-200">
              <strong className="mr-2 text-cyan-400">Organization:</strong>
              {user?.orgHierarchy?.length > 0 ? (
                user.orgHierarchy.map((o, index) => (
                  <span key={o._id || index} className="flex items-center gap-1">
                    <span className="px-2 py-1 bg-slate-700/60 rounded-md text-sm text-gray-100 hover:bg-cyan-700 transition-colors duration-200">
                      {o.name}
                    </span>
                    {index < user.orgHierarchy.length - 1 && (
                      <span className="text-gray-400">→</span>
                    )}
                  </span>
                ))
              ) : (
                <span className="text-gray-400">—</span>
              )}
            </p>
          </section>

          {/* Profile Edit Form */}
          {isEditing && (
            <form
              onSubmit={handleProfileUpdate}
              className="mb-10 bg-slate-800/70 p-6 rounded-xl border border-gray-700 space-y-4"
            >
              <h2 className="text-lg font-semibold text-cyan-300 flex items-center gap-2">
                <FaEdit /> Edit Profile
              </h2>

              <div>
                <label className="block text-gray-300 mb-1">Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Enter new name"
                  className="w-full px-3 py-2 bg-slate-900/70 border border-gray-600 rounded-md text-gray-100 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-gray-300 mb-1">Avatar</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setSelectedFile(e.target.files[0])}
                  className="w-full bg-slate-900/70 border border-gray-600 rounded-md p-2 text-gray-200"
                />
              </div>

              <button
                type="submit"
                disabled={updating}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg text-white shadow-md hover:shadow-green-500/30 transition-all"
              >
                {updating ? "Updating..." : (<><FaSave /> Save Changes</>)}
              </button>
            </form>
          )}

          {/* Admin Requests */}
          {["superAdmin", "orgAdmin", "deptAdmin"].includes(user?.role) &&
            adminRequests.length > 0 && (
              <section className="mb-10">
                <h2 className="text-xl font-semibold text-purple-400 mb-4 border-b border-gray-700 pb-2">
                  Pending Admin Requests
                </h2>
                <div className="space-y-4">
                  {adminRequests.map((r) => (
                    <div
                      key={r._id}
                      className="p-4 bg-slate-800/70 border border-gray-700 rounded-xl shadow-md
                                 flex justify-between items-center hover:bg-slate-700/80 hover:scale-[1.03]
                                 hover:shadow-xl hover:shadow-purple-500/20 transition-all duration-300"
                    >
                      <div className="text-gray-200">
                        <p>
                          <strong>{r.sender?.name || "Unknown"}</strong> wants you to be admin for{" "}
                          <strong className="text-purple-300">
                            {r.departmentId?.name || r.orgId?.name || "N/A"}
                          </strong>
                        </p>
                      </div>
                      <div className="space-x-2">
                        <button
                          onClick={() => respondToRequest(r._id, "approve")}
                          className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded-lg shadow-md hover:shadow-purple-500/30 transition-all"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => respondToRequest(r._id, "reject")}
                          className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-lg shadow-md hover:shadow-red-500/30 transition-all"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

          {/* User Requests */}
          {myRequests.length > 0 && (
            <section>
              <h2 className="text-xl font-semibold text-cyan-400 mb-4 border-b border-gray-700 pb-2">
                My Pending Requests
              </h2>
              <div className="space-y-4">
                {myRequests.map((r) => (
                  <div
                    key={r._id}
                    className="p-4 bg-slate-800/70 border border-gray-700 rounded-xl shadow-md
                               flex justify-between items-center hover:bg-slate-700/80 hover:scale-[1.03]
                               hover:shadow-xl hover:shadow-green-500/20 transition-all duration-300"
                  >
                    <div className="text-gray-200 space-y-1">
                      <p>
                        <strong>{r.sender?.name || "Someone"}</strong> sent you a{" "}
                        <span className="capitalize text-cyan-300">{r.type}</span> request for{" "}
                        <strong className="text-cyan-300">
                          {r.orgId?.name || r.departmentId?.name || "Organization"}
                        </strong>
                      </p>
                      {r.message && <p className="italic text-sm text-gray-400">{r.message}</p>}
                    </div>
                    <div className="space-x-2">
                      <button
                        onClick={() => respondToRequest(r._id, "approve")}
                        className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-lg shadow-md hover:shadow-green-500/30 transition-all"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => respondToRequest(r._id, "reject")}
                        className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-lg shadow-md hover:shadow-red-500/30 transition-all"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
