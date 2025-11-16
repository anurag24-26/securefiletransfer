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
  const [requests, setRequests] = useState([]);
  const [admins, setAdmins] = useState([]);

  const [selectedUserId, setSelectedUserId] = useState("");
  const [selectedDeptId, setSelectedDeptId] = useState("");
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(null);

  useEffect(() => {
    if (!token) navigate("/login");
  }, [token, navigate]);

  useEffect(() => {
    if (!token || !user) return;

    if (!["superAdmin", "orgAdmin"].includes(user.role)) {
      navigate("/");
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);

        const [usersRes, deptRes, reqRes, adminsRes] = await Promise.all([
          api.get("/requests/users/list", { headers: { Authorization: `Bearer ${token}` } }),
          api.get("/requests/departments/list", { headers: { Authorization: `Bearer ${token}` } }),
          api.get("/requests", { headers: { Authorization: `Bearer ${token}` } }),
          api.get("/requests/admins/list", { headers: { Authorization: `Bearer ${token}` } }),
        ]);

        setAllUsers(usersRes.data.users || []);
        setDepartments(deptRes.data.departments || []);
        setRequests(reqRes.data.requests || []);
        setAdmins(adminsRes.data.admins || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token, user, navigate]);

  const handleSendRequest = async () => {
    if (!selectedUserId || !selectedDeptId) {
      alert("Select both user & department");
      return;
    }

    try {
      await api.post(
        "/requests",
        {
          type: "admin",
          targetUser: selectedUserId,
          departmentId: selectedDeptId,
          requestedRole: "deptAdmin",
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert("Admin request sent");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to send request");
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
    } catch (err) {
      alert("Failed to process request");
    }

    setProcessing(null);
  };

  const handleRemoveAdmin = async (adminId) => {
  if (!window.confirm("Remove this admin?")) return;

  setProcessing(adminId);

  try {
    await api.post(
      `requests/admin/remove/${adminId}`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );

    setAdmins((prev) => prev.filter((a) => a._id !== adminId));
    alert("Admin removed");
  } catch (err) {
    alert(err.response?.data?.message || "Failed to remove admin");
  }

  setProcessing(null);
};


  if (loading) return <Loader />;

  return (
    <div className="min-h-screen p-5 md:p-10 bg-gradient-to-tr from-slate-200 to-slate-300">

      <h2 className="text-3xl md:text-4xl font-bold text-center mb-10 text-gray-800">
        Admin Settings
      </h2>

      {/* Assign Department Admin */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-3xl mx-auto p-6 bg-white rounded-2xl shadow-xl mb-12"
      >
        <h3 className="text-xl font-semibold text-gray-700 mb-5">Assign Department Admin</h3>

        <div className="flex flex-col md:flex-row gap-4">
          <select
            className="p-3 border rounded-xl flex-1"
            value={selectedUserId}
            onChange={(e) => setSelectedUserId(e.target.value)}
          >
            <option value="">Select User</option>
            {allUsers.map((u) => (
              <option key={u._id} value={u._id}>
                {u.name} ({u.email})
              </option>
            ))}
          </select>

          <select
            className="p-3 border rounded-xl flex-1"
            value={selectedDeptId}
            onChange={(e) => setSelectedDeptId(e.target.value)}
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
            className="bg-indigo-600 text-white px-6 py-3 rounded-xl shadow-md hover:bg-indigo-700"
          >
            Send
          </button>
        </div>
      </motion.section>

      {/* Current Admins */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-3xl mx-auto p-6 bg-white rounded-2xl shadow-xl mb-12"
      >
        <h3 className="text-xl font-semibold text-gray-700 mb-5">Current Admins</h3>

        {admins.length === 0 ? (
          <p className="text-gray-500 text-center">No admins assigned.</p>
        ) : (
         <div className="space-y-4">
  {admins.map((a) => (
    <div
      key={a._id}
      className="p-4 bg-white/70 backdrop-blur-sm border rounded-xl flex justify-between items-center shadow-sm hover:shadow-md transition"
    >
      <div>
        <p className="font-semibold text-gray-800">{a.name}</p>
        <p className="text-sm text-blue-600 capitalize">{a.role}</p>

        {/* Show department admin info */}
        {a.role === "deptAdmin" && a.departmentId?.name && (
          <p className="text-sm text-gray-500">
            Dept: <span className="font-medium">{a.departmentId.name}</span>
          </p>
        )}

        {/* Show org admin info */}
        {a.role === "orgAdmin" && a.orgId?.name && (
          <p className="text-sm text-gray-500">
            Organization: <span className="font-medium">{a.orgId.name}</span>
          </p>
        )}
      </div>

      <button
        disabled={processing === a._id}
        onClick={() => handleRemoveAdmin(a._id)}
        className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 disabled:opacity-50 transition"
      >
        Remove
      </button>
    </div>
  ))}
</div>

        )}
      </motion.section>

      {/* Pending Requests */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-3xl mx-auto p-6 bg-white rounded-2xl shadow-xl"
      >
        <h3 className="text-xl font-semibold text-gray-700 mb-5">Pending Requests</h3>

        {requests.length === 0 ? (
          <p className="text-gray-500 text-center">No pending requests.</p>
        ) : (
          <AnimatePresence>
            {requests.map((req) => (
              <motion.div
                key={req._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="p-4 bg-white border rounded-xl mb-4 flex justify-between items-center"
              >
                <div>
                  <p className="font-semibold">{req.sender?.name}</p>
                  <p className="text-sm text-blue-500">{req.type}</p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => handleRequestResponse(req._id, "approve")}
                    className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
                  >
                    Approve
                  </button>

                  <button
                    onClick={() => handleRequestResponse(req._id, "reject")}
                    className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
                  >
                    Reject
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </motion.section>
    </div>
  );
};

export default AdminSettings;
