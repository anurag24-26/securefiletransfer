import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import api from "../services/api";
import { useNavigate } from "react-router-dom";
import Loader from "../components/Loader";
import { motion, AnimatePresence } from "framer-motion";

const AdminSettings = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();

  const [allUsers, setAllUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [selectedDeptId, setSelectedDeptId] = useState("");
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(null);

  useEffect(() => {
    if (!token) navigate("/login");
  }, [token, navigate]);

  useEffect(() => {
    if (!token || !user) return;

    const fetchData = async () => {
      setLoading(true);
      setError(null);

      if (!["superAdmin", "orgAdmin", "deptAdmin"].includes(user.role)) {
        navigate("/");
        return;
      }

      try {
        const [usersRes, deptRes, reqRes] = await Promise.all([
          api.get("/requests/users/list", { headers: { Authorization: `Bearer ${token}` } }),
          api.get("/requests/departments/list", { headers: { Authorization: `Bearer ${token}` } }),
          api.get("/requests", { headers: { Authorization: `Bearer ${token}` } }),
        ]);

        setAllUsers(usersRes.data.users || []);
        setDepartments(deptRes.data.departments || []);
        setRequests(reqRes.data.requests || []);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token, user, navigate]);

  const handleSendRequest = async () => {
    if (!selectedUserId || !selectedDeptId) {
      alert("Please select both user and department.");
      return;
    }

    try {
      await api.post(
        "/requests",
        { type: "admin", targetUser: selectedUserId, departmentId: selectedDeptId, requestedRole: "deptAdmin" },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert("Admin request sent successfully.");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to send admin request.");
    }
  };

  const handleRequestResponse = async (requestId, action) => {
    setProcessing(requestId);
    try {
      await api.post(
        `/requests/${requestId}/action`,
        { action },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setRequests((prev) => prev.filter((r) => r._id !== requestId));
      alert(`Request ${action}ed successfully.`);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to process request.");
    } finally {
      setProcessing(null);
    }
  };

  if (loading) return <Loader />;
  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-500 text-lg">{error}</p>
      </div>
    );

  return (
    <div className="min-h-screen p-4 sm:p-6 md:p-10 bg-gradient-to-tr from-gray-100 via-gray-200 to-gray-300 flex flex-col items-center">
      <h2 className="text-3xl sm:text-4xl font-extrabold mb-10 text-center text-gray-800 drop-shadow-md">
        Admin Settings
      </h2>

      {/* --- Assign Department Admin Section --- */}
      <section className="w-full max-w-3xl mb-10 p-6 bg-white/40 backdrop-blur-xl rounded-3xl shadow-2xl space-y-4 sm:space-y-6 transition hover:shadow-indigo-500/30 hover:scale-105 transform">
        <h3 className="text-xl font-semibold text-gray-700 text-center sm:text-left">
          Assign Department Admin
        </h3>
        <div className="flex flex-col sm:flex-row gap-4">
          <select
            value={selectedUserId}
            onChange={(e) => setSelectedUserId(e.target.value)}
            className="flex-1 p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-400 outline-none backdrop-blur-sm"
          >
            <option value="">Select User</option>
            {allUsers.map((u) => (
              <option key={u._id} value={u._id}>
                {u.name} ({u.email})
              </option>
            ))}
          </select>

          <select
            value={selectedDeptId}
            onChange={(e) => setSelectedDeptId(e.target.value)}
            className="flex-1 p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-400 outline-none backdrop-blur-sm"
          >
            <option value="">Select Department</option>
            {departments.map((d) => (
              <option key={d._id} value={d._id}>
                {d.name}
              </option>
            ))}
          </select>

          <button
            onClick={handleSendRequest}
            className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white px-6 py-3 rounded-full font-semibold hover:scale-105 transition transform shadow-lg hover:shadow-purple-400/50"
          >
            Send Request
          </button>
        </div>
      </section>

      {/* --- Pending Requests Section --- */}
      <section className="w-full max-w-3xl space-y-6">
        <h3 className="text-xl font-semibold mb-4 text-gray-700 text-center sm:text-left">
          Pending Requests
        </h3>
        {requests.length === 0 ? (
          <p className="text-gray-600 text-center">No pending requests.</p>
        ) : (
          <div className="space-y-4">
            <AnimatePresence>
              {requests.map((req) => (
                <motion.div
                  key={req._id}
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-gray-300 rounded-2xl bg-white/30 backdrop-blur-xl shadow-md hover:shadow-indigo-400/40 transition transform hover:scale-105"
                >
                  <div className="mb-3 sm:mb-0 text-center sm:text-left space-y-1">
                    <p className="font-semibold text-gray-800">{req.sender?.name || "Unknown"}</p>
                    <p className="text-blue-600 font-medium">
                      {req.departmentId?.name || req.orgId?.name || "Unassigned"}{" "}
                      <span className="text-gray-500 text-sm">({req.type})</span>
                    </p>
                  </div>
                  <div className="flex gap-3 justify-center sm:justify-end">
                    <button
                      disabled={processing === req._id}
                      onClick={() => handleRequestResponse(req._id, "approve")}
                      className="bg-green-500 text-white px-4 py-2 rounded-full hover:bg-green-600 disabled:opacity-50 transition transform hover:scale-105 shadow"
                    >
                      Approve
                    </button>
                    <button
                      disabled={processing === req._id}
                      onClick={() => handleRequestResponse(req._id, "reject")}
                      className="bg-red-500 text-white px-4 py-2 rounded-full hover:bg-red-600 disabled:opacity-50 transition transform hover:scale-105 shadow"
                    >
                      Reject
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </section>
    </div>
  );
};

export default AdminSettings;
