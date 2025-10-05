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
  const [regeneratingId, setRegeneratingId] = useState(null);

  // For managing users under selected org
  const [selectedOrgId, setSelectedOrgId] = useState(null);
  const [users, setUsers] = useState([]);
  const [userLoading, setUserLoading] = useState(false);
  const [userError, setUserError] = useState(null);
  const [newUser, setNewUser] = useState({ name: "", email: "", password: "", role: "user" });
  const [addingUser, setAddingUser] = useState(false);

  // Redirect if not logged in
  useEffect(() => {
    if (!token) navigate("/login");
  }, [token, navigate]);

  // Fetch organizations
  const fetchOrgs = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get("/org/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      let organizations = res.data.organizations || [];

      // If user is normal user (no admin roles), fetch their department org if not included
      if (!["superAdmin", "orgAdmin", "deptAdmin"].includes(user?.role)) {
        // Attempt fetching user's org by id
        const userOrgId = user?.orgId?._id || user?.orgId;
        if (userOrgId && !organizations.find((o) => o._id === userOrgId)) {
          try {
            const orgRes = await api.get(`/org/hierarchy/${userOrgId}`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            if (orgRes.data) {
              organizations = [...organizations, orgRes.data];
            }
          } catch {
            // Ignore error here
          }
        }
      }

      setOrgs(organizations);
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
      setSelectedOrgId(null);
      setUsers([]);
    }
  }, [token]);

  // Create or Update Org
  const handleSubmit = async (e) => {
    e.preventDefault();
    setJoinCode(null);

    const payload = {
      name: form.name.trim(),
      type: form.type,
      parentId: form.parentId.trim() === "" ? null : form.parentId,
      deptAdminId: form.deptAdminId.trim() === "" ? null : form.deptAdminId,
    };

    try {
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

  // Delete Org
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this organization?")) return;
    try {
      await api.delete(`/org/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchOrgs();
      if (selectedOrgId === id) {
        setSelectedOrgId(null);
        setUsers([]);
      }
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete organization.");
    }
  };

  // Edit Org
  const handleEdit = (org) => {
    setEditing(org._id);
    setJoinCode(null);
    setForm({
      name: org.name || "",
      type: org.type || "",
      parentId: org.parentId?._id || org.parentId || "",
      deptAdminId: org.admin?._id || org.admin || "",
    });
  };

  // Regenerate Join Code
  const handleRegenerateCode = async (orgId) => {
    setRegeneratingId(orgId);
    try {
      const res = await api.post(
        `/org/${orgId}/generate-code`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      alert(`New join code: ${res.data.joinCode}`);
      fetchOrgs();
    } catch {
      alert("Failed to regenerate join code.");
    } finally {
      setRegeneratingId(null);
    }
  };

  // Fetch Users under selected organization/department
  const fetchUsers = async (orgId) => {
    setUserLoading(true);
    setUserError(null);
    try {
      const res = await api.get(`/org/${orgId}/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(res.data.users || []);
    } catch (err) {
      setUserError("Failed to load users.");
      setUsers([]);
    } finally {
      setUserLoading(false);
    }
  };

  // Select org and fetch users under it
  const handleSelectOrgUsers = (orgId) => {
    setSelectedOrgId(orgId);
    fetchUsers(orgId);
  };

  // Add new user under selected org
  const handleAddUser = async (e) => {
  e.preventDefault();
  if (!selectedOrgId) {
    alert("Please select an organization or department first.");
    return;
  }
  setAddingUser(true);
  try {
    // Send a join request instead of direct creation
    const payload = {
      email: newUser.email,
      requestedRole: newUser.role,
      orgId: selectedOrgId,
      message: "Request to join organization",
      type: "join", // type of request
    };

    await api.post("/requests", payload, {
      headers: { Authorization: `Bearer ${token}` },
    });

    alert("Request sent to the user for approval.");
    setNewUser({ email: "", role: "user" });
    fetchUsers(selectedOrgId);
  } catch (err) {
    alert(err.response?.data?.message || "Failed to send join request.");
  } finally {
    setAddingUser(false);
  }
};


  // Permission helpers
  const canManageOrgs = ["superAdmin", "orgAdmin"].includes(user?.role);
  const canManageDept = ["superAdmin", "orgAdmin", "deptAdmin"].includes(user?.role);

  // Loading or Error State for orgs
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600 text-lg">Loading organizations...</p>
      </div>
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
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto bg-white shadow-lg rounded-xl p-8">
        <h2 className="text-3xl font-bold text-center mb-6">Organization & Department Management</h2>

        {(user?.role === "superAdmin" || user?.role === "orgAdmin") && (
          <form onSubmit={handleSubmit} className="mb-8 p-6 bg-gray-100 rounded-lg shadow-inner space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <input
                type="text"
                placeholder="Organization / Department Name"
                className="border p-3 rounded-md w-full"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
              <select
                className="border p-3 rounded-md w-full"
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                required
              >
                <option value="">Select Type</option>
                <option value="university">University</option>
                <option value="business">Business</option>
                <option value="hospital">Hospital</option>
                <option value="department">Department</option>
              </select>
              <select
                className="border p-3 rounded-md w-full"
                value={form.parentId}
                onChange={(e) => setForm({ ...form, parentId: e.target.value })}
              >
                <option value="">Parent (for Departments)</option>
                {orgs.filter((o) => o.type !== "department").map((o) => (
                  <option key={o._id} value={o._id}>
                    {o.name} ({o.type})
                  </option>
                ))}
              </select>
              <input
                type="text"
                placeholder="Dept Admin User ID (optional)"
                className="border p-3 rounded-md w-full"
                value={form.deptAdminId}
                onChange={(e) => setForm({ ...form, deptAdminId: e.target.value })}
              />
            </div>
            <div className="flex items-center gap-4">
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md transition"
              >
                {editing ? "Update" : "Add"}
              </button>
              {editing && (
                <button
                  type="button"
                  className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded-md transition"
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
            {joinCode && <p className="mt-2 text-green-600 font-semibold">New join code: {joinCode}</p>}
          </form>
        )}

        <table className="w-full border border-gray-300 rounded-md">
          <thead className="bg-gray-200">
            <tr>
              <th className="p-3 border">Name</th>
              <th className="p-3 border">Type</th>
              <th className="p-3 border">Parent</th>
              {(user?.role === "superAdmin" || user?.role === "orgAdmin") && (
                <>
                  <th className="p-3 border">Join Code</th>
                  <th className="p-3 border">Actions</th>
                  <th className="p-3 border">Users</th>
                </>
              )}
              {user?.role === "deptAdmin" && <th className="p-3 border">Users</th>}
            </tr>
          </thead>
          <tbody>
            {orgs.length === 0 ? (
              <tr>
                <td colSpan={user?.role === "superAdmin" || user?.role === "orgAdmin" ? 6 : 4} className="text-center p-3 border">
                  No organizations found.
                </td>
              </tr>
            ) : (
              orgs.map((org) => (
                <tr key={org._id} className="hover:bg-gray-50">
                  <td className="p-3 border">{org.name}</td>
                  <td className="p-3 border capitalize">{org.type}</td>
                  <td className="p-3 border">{org.parentId?.name || "—"}</td>
                  {(user?.role === "superAdmin" || user?.role === "orgAdmin") && (
                    <>
                      <td className="p-3 border font-mono">{org.joinCode || "N/A"}</td>
                      <td className="p-3 border flex gap-2 flex-wrap">
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
                      <td className="p-3 border">
                        <button
                          onClick={() => handleSelectOrgUsers(org._id)}
                          className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1 rounded-md"
                        >
                          View Users
                        </button>
                      </td>
                    </>
                  )}
                  {(user?.role === "deptAdmin" || (!user?.role || user?.role === "user")) && (
                    <td className="p-3 border">
                      <button
                        onClick={() => handleSelectOrgUsers(org._id)}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1 rounded-md"
                        disabled={!(user?.role === "deptAdmin")}
                      >
                        View Users
                      </button>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Users under selected org */}
        {selectedOrgId && (
          <div className="mt-8 bg-white p-6 rounded-lg shadow-inner">
            <h3 className="text-2xl font-semibold mb-4">
              Users under Organization / Department
            </h3>

            {userLoading ? (
              <p>Loading users...</p>
            ) : userError ? (
              <p className="text-red-500">{userError}</p>
            ) : users.length === 0 ? (
              <p>No users found.</p>
            ) : (
              <table className="w-full border border-gray-300 rounded-md">
                <thead className="bg-gray-200">
                  <tr>
                    <th className="p-3 border">Name</th>
                    <th className="p-3 border">Email</th>
                    <th className="p-3 border">Role</th>
                    <th className="p-3 border">Organization</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-gray-50">
                      <td className="p-3 border">{u.name}</td>
                      <td className="p-3 border">{u.email}</td>
                      <td className="p-3 border">{u.role}</td>
                      <td className="p-3 border">{u.organization || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {/* Add user form - Only for admins */}
            {(user?.role === "superAdmin" || user?.role === "orgAdmin" || user?.role === "deptAdmin") && (
              <form onSubmit={handleAddUser} className="mt-6 space-y-4 p-4 border rounded shadow-inner bg-gray-50">
                <h4 className="text-xl font-semibold">Add New User</h4>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  
                  <input
                    type="email"
                    placeholder="Email"
                    className="border p-3 rounded-md w-full"
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    required
                    disabled={addingUser}
                  />
                  
                  <select
                    className="border p-3 rounded-md w-full"
                    value={newUser.role}
                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                    disabled={addingUser}
                  >
                    <option value="user">User</option>
                    <option value="deptAdmin">Dept Admin</option>
                    <option value="orgAdmin">Org Admin</option>
                    {/* Only superAdmin can assign superAdmin role */}
                    {user.role === "superAdmin" && <option value="superAdmin">Super Admin</option>}
                  </select>
                </div>
                <button
                  type="submit"
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-md transition"
                  disabled={addingUser}
                >
                  {addingUser ? "Adding..." : "Add User"}
                </button>
              </form>
            )}
          </div>
        )}

        <p className="mt-4 text-sm text-gray-600 text-center">
          * You can set department admins during creation/editing. Join codes are generated automatically. Only authorized admins can see/edit actions.
        </p>
      </div>
    </div>
  );
};

export default OrgList;
