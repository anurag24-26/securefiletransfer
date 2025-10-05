import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import api from "../services/api";
import { useNavigate } from "react-router-dom";

const AdminSettings = () => {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();

  const [allUsers, setAllUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [selectedDeptId, setSelectedDeptId] = useState("");
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [requestProcessingId, setRequestProcessingId] = useState(null);

  // Redirect if not an admin
  useEffect(() => {
    if (!user || !token) {
      navigate("/login");
    } else if (!["superAdmin", "orgAdmin", "deptAdmin"].includes(user.role)) {
      navigate("/"); // redirect non-admins
    }
  }, [user, token, navigate]);

  useEffect(() => {
    if (!token || !user) return;

    setLoading(true);
    setError(null);

    // Fetch all users in org
    const fetchUsers = async () => {
      try {
        const res = await api.get("/admin/users/emails", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAllUsers(res.data.users);
      } catch (err) {
        setError("Failed to load users");
      }
    };

    // Fetch all departments in org
    const fetchDepartments = async () => {
      try {
        const res = await api.get("/admin/departments", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setDepartments(res.data.departments);
      } catch (err) {
        setError("Failed to load departments");
      }
    };

    // Fetch admin requests for current user (if deptAdmin or others)
    const fetchRequests = async () => {
      try {
        const res = await api.get("/admin/requests", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setRequests(res.data.requests);
      } catch (err) {
        // Can ignore if no requests
      }
    };

    fetchUsers();
    fetchDepartments();
    fetchRequests();

    setLoading(false);
  }, [token, user]);

  const handleSendRequest = async () => {
    if (!selectedUserId || !selectedDeptId) {
      alert("Please select user and department");
      return;
    }

    try {
      await api.post(
        "/admin/requests",
        {
          targetUserId: selectedUserId,
          departmentId: selectedDeptId,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Admin request sent successfully");
    } catch {
      alert("Failed to send admin request");
    }
  };

  const handleRequestResponse = async (requestId, action) => {
    setRequestProcessingId(requestId);
    try {
      await api.post(
        `/admin/requests/${requestId}/respond`,
        { action },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert(`Request ${action}ed`);
      // Refresh requests
      const res = await api.get("/admin/requests", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRequests(res.data.requests);
    } catch {
      alert("Failed to process request");
    } finally {
      setRequestProcessingId(null);
    }
  };

  if (!user) return null; // Or loading spinner

  return (
    <div className="p-6 max-w-5xl mx-auto bg-white rounded shadow mt-8">
      <h2 className="text-2xl font-semibold mb-6">Manage Admin Settings</h2>

      {error && <p className="text-red-600 mb-4">{error}</p>}

      <section className="mb-8">
        <h3 className="text-xl font-semibold mb-4">Assign Department Admin</h3>
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <select
            value={selectedUserId}
            onChange={(e) => setSelectedUserId(e.target.value)}
            className="border rounded p-2 flex-1"
          >
            <option value="">Select User</option>
            {allUsers.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name} ({u.email})
              </option>
            ))}
          </select>

          <select
            value={selectedDeptId}
            onChange={(e) => setSelectedDeptId(e.target.value)}
            className="border rounded p-2 flex-1"
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
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Send Request
          </button>
        </div>
      </section>

      <section>
        <h3 className="text-xl font-semibold mb-4">Pending Admin Requests</h3>

        {requests.length === 0 && <p>No pending requests</p>}

        {requests.length > 0 && (
          <table className="table-auto w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="border px-4 py-2">From</th>
                <th className="border px-4 py-2">Department</th>
                <th className="border px-4 py-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((req) => (
                <tr key={req._id} className="hover:bg-gray-50">
                  <td className="border px-4 py-2">{req.sender.name} ({req.sender.email})</td>
                  <td className="border px-4 py-2">{req.department.name}</td>
                  <td className="border px-4 py-2 space-x-2">
                    <button
                      onClick={() => handleRequestResponse(req._id, "accept")}
                      disabled={requestProcessingId === req._id}
                      className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => handleRequestResponse(req._id, "reject")}
                      disabled={requestProcessingId === req._id}
                      className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                    >
                      Reject
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
};

export default AdminSettings;
