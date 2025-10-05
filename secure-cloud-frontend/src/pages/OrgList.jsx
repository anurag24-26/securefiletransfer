import React, { useState, useEffect } from "react";
import api from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

const OrgList = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();

  const [orgs, setOrgs] = useState([]);
  const [form, setForm] = useState({ name: "", type: "", parentId: "", deptAdminId: "" });
  const [editing, setEditing] = useState(null);
  const [joinCode, setJoinCode] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [regeneratingId, setRegeneratingId] = useState(null); // Track which org's code is regenerating

  useEffect(() => {
    if (!token) navigate("/login");
  }, [token, navigate]);

  const fetchOrgs = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get("/org/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrgs(res.data.organizations || []);
    } catch (err) {
      setError("Failed to load organizations. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchOrgs();
      setJoinCode(null);
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setJoinCode(null);
    try {
      const payload = {
        name: form.name.trim(),
        type: form.type,
        parentId: form.parentId.trim() === "" ? null : form.parentId,
        deptAdminId: form.deptAdminId.trim() === "" ? null : form.deptAdminId,
      };

      if (editing) {
        await api.put(`/org/${editing}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setEditing(null);
      } else {
        const res = await api.post("/org/create", payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.data.joinCode) setJoinCode(res.data.joinCode);
      }

      setForm({ name: "", type: "", parentId: "", deptAdminId: "" });
      fetchOrgs();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to save organization.");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this organization?")) {
      try {
        await api.delete(`/org/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        fetchOrgs();
      } catch {
        alert("Failed to delete organization.");
      }
    }
  };

  const handleEdit = (org) => {
    setEditing(org._id);
    setJoinCode(null);
    setForm({
      name: org.name,
      type: org.type,
      parentId: org.parentId?._id || org.parentId || "",
      deptAdminId: org.admin || "",
    });
  };

  const handleRegenerateCode = async (orgId) => {
    setRegeneratingId(orgId);
    try {
      const res = await api.post(`/org/${orgId}/generate-join-code`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert(`New join code: ${res.data.joinCode}`);
      fetchOrgs();
    } catch {
      alert("Failed to regenerate join code.");
    } finally {
      setRegeneratingId(null);
    }
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600 text-lg">Loading organizations...</p>
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-500 text-lg">{error}</p>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-3xl font-semibold mb-6 text-center">Organization & Department Management</h2>

        {(user?.role === "orgAdmin" || user?.role === "superAdmin") && (
          <form onSubmit={handleSubmit} className="mb-8 space-y-4 bg-gray-100 p-6 rounded-lg">
            <div className="flex flex-col md:flex-row gap-4">
              <input
                type="text"
                placeholder="Organization / Department Name"
                className="border p-3 rounded-md flex-grow"
                value={form.name}
                name="name"
                onChange={e => setForm({ ...form, name: e.target.value })}
                required
              />
              <select
                className="border p-3 rounded-md flex-grow"
                value={form.type}
                name="type"
                onChange={e => setForm({ ...form, type: e.target.value })}
                required
              >
                <option value="">Select Type</option>
                <option value="university">University</option>
                <option value="business">Business</option>
                <option value="hospital">Hospital</option>
                <option value="department">Department</option>
              </select>
              <select
                className="border p-3 rounded-md flex-grow"
                value={form.parentId}
                name="parentId"
                onChange={e => setForm({ ...form, parentId: e.target.value })}
              >
                <option value="">Parent (for Departments)</option>
                {orgs
                  .filter(o => o.type !== "department")
                  .map(o => (
                    <option key={o._id} value={o._id}>
                      {o.name} ({o.type})
                    </option>
                  ))}
              </select>
              <input
                type="text"
                placeholder="Department Admin User ID (optional)"
                className="border p-3 rounded-md flex-grow"
                value={form.deptAdminId}
                name="deptAdminId"
                onChange={e => setForm({ ...form, deptAdminId: e.target.value })}
              />
            </div>
            <div className="flex items-center gap-4">
              <button
                type="submit"
                className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition"
              >
                {editing ? "Update" : "Add"}
              </button>
              {editing && (
                <button
                  type="button"
                  className="bg-gray-400 text-white px-4 py-3 rounded-md hover:bg-gray-500 transition"
                  onClick={() => {
                    setEditing(null);
                    setForm({ name: "", type: "", parentId: "", deptAdminId: "" });
                    setJoinCode(null);
                  }}
                >
                  Cancel
                </button>
              )}
            </div>
            {joinCode && (
              <p className="mt-3 text-green-600 font-semibold">New join code: {joinCode}</p>
            )}
          </form>
        )}

        <table className="w-full border-collapse border border-gray-300 rounded-md">
          <thead>
            <tr className="bg-gray-200">
              <th className="border border-gray-300 p-3 text-left">Name</th>
              <th className="border border-gray-300 p-3 text-left">Type</th>
              <th className="border border-gray-300 p-3 text-left">Parent</th>
              {(user?.role === "orgAdmin" || user?.role === "superAdmin") && (
                <>
                  <th className="border border-gray-300 p-3 text-left">Join Code</th>
                  <th className="border border-gray-300 p-3 text-left">Actions</th>
                </>
              )}
            </tr>
          </thead>
          <tbody>
            {orgs.length === 0 ? (
              <tr>
                <td colSpan={ user?.role === "superAdmin" || user?.role === "orgAdmin" ? 5 : 3 } className="p-3 text-center border border-gray-300">
                  No organizations found.
                </td>
              </tr>
            ) : (
              orgs.map(org => (
                <tr key={org._id} className="hover:bg-gray-50">
                  <td className="border border-gray-300 p-3">{org.name}</td>
                  <td className="border border-gray-300 p-3 capitalize">{org.type}</td>
                  <td className="border border-gray-300 p-3">{org.parentId?.name || "—"}</td>

                  {(user?.role === "orgAdmin" || user?.role === "superAdmin") && (
                    <>
                      <td className="border border-gray-300 p-3 font-mono">{org.joinCode || "N/A"}</td>
                      <td className="border border-gray-300 p-3 flex gap-2">
                        <button
                          onClick={() => handleEdit(org)}
                          className="bg-yellow-400 hover:bg-yellow-500 text-white px-3 py-1 rounded-md"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(org._id)}
                          className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md"
                        >
                          Delete
                        </button>
                        <button
                          disabled={regeneratingId === org._id}
                          onClick={() => handleRegenerateCode(org._id)}
                          className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-md"
                        >
                          {regeneratingId === org._id ? "Regenerating..." : "Regenerate Code"}
                        </button>
                      </td>
                    </>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>

        <p className="mt-3 text-sm text-gray-600 text-center">
          * You can set department admins during creation/editing. Join codes are generated automatically.
        </p>
      </div>
    </div>
  );
};

export default OrgList;
