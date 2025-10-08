import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import api from "../services/api";
import { useNavigate } from "react-router-dom";
import Loader from "../components/Loader";
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

  // Redirect if not logged in
  useEffect(() => {
    if (!token) navigate("/login");
  }, [token, navigate]);

  // Fetch all necessary data
  useEffect(() => {
    if (!token || !user) return;

    const fetchData = async () => {
      setLoading(true);
      setError(null);

      // Only admins can access
      if (!["superAdmin", "orgAdmin", "deptAdmin"].includes(user.role)) {
        navigate("/");
        return;
      }

      try {
        // 🧩 Get all users, orgs, and pending requests
        const [usersRes, deptRes, reqRes] = await Promise.all([
          api.get("/requests/users/list", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          api.get("/requests/departments/list", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          api.get("/requests", {
            headers: { Authorization: `Bearer ${token}` },
          }),
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

  // 📤 Send admin promotion request
  const handleSendRequest = async () => {
    if (!selectedUserId || !selectedDeptId) {
      alert("Please select both user and department.");
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

      alert("Admin request sent successfully.");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to send admin request.");
    }
  };

  // ✅ Handle approve/reject request
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

   if (loading) {
    return (
      <>
    <Loader/>
    </>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-500 text-lg">{error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6 bg-white rounded-lg shadow-md mt-10">
      <h2 className="text-3xl font-bold mb-8 text-center text-gray-800">
        Admin Settings
      </h2>

      {/* --- Assign Department Admin Section --- */}
      <section className="mb-10">
        <h3 className="text-xl font-semibold mb-4 text-gray-700">
          Assign Department Admin
        </h3>
        <div className="flex flex-col md:flex-row gap-4">
          <select
            value={selectedUserId}
            onChange={(e) => setSelectedUserId(e.target.value)}
            className="border border-gray-300 rounded-md p-3 flex-1 focus:outline-blue-500"
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
            className="border border-gray-300 rounded-md p-3 flex-1 focus:outline-blue-500"
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
            className="bg-blue-600 text-white rounded-md px-6 py-3 hover:bg-blue-700 transition duration-200 font-semibold"
          >
            Send Request
          </button>
        </div>
      </section>

      {/* --- Pending Requests Section --- */}
      <section>
        <h3 className="text-xl font-semibold mb-4 text-gray-700">
          Pending Requests
        </h3>
        {requests.length === 0 ? (
          <p className="text-gray-600">No pending requests.</p>
        ) : (
          <div className="space-y-4">
            {requests.map((req) => (
              <div
                key={req._id}
                className="flex flex-col md:flex-row md:items-center md:justify-between p-4 border border-gray-300 rounded-md hover:shadow"
              >
                <div className="mb-3 md:mb-0">
                  <span className="font-semibold text-gray-800">
                    {req.sender?.name || "Unknown"}
                  </span>{" "}
                  <span className="text-gray-500">&rarr;</span>{" "}
                  <span className="font-medium text-blue-600">
                    {req.departmentId?.name ||
                      req.orgId?.name ||
                      "Unassigned"}
                  </span>{" "}
                  <span className="ml-2 text-gray-600 text-sm">
                    ({req.type})
                  </span>
                </div>
                <div className="flex gap-3">
                  <button
                    disabled={processing === req._id}
                    onClick={() => handleRequestResponse(req._id, "approve")}
                    className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50"
                  >
                    Approve
                  </button>
                  <button
                    disabled={processing === req._id}
                    onClick={() => handleRequestResponse(req._id, "reject")}
                    className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 disabled:opacity-50"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default AdminSettings;
