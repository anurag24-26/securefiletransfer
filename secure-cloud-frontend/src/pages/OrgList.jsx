import React, { useState, useEffect } from "react";
import api from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import Loader from "../components/Loader";

const Pill = ({ children, tone = "default" }) => {
  const tones = {
    default: "bg-gray-100 text-gray-800",
    info: "bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-200",
    success: "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200",
    warn: "bg-amber-50 text-amber-800 ring-1 ring-inset ring-amber-200",
    danger: "bg-red-50 text-red-700 ring-1 ring-inset ring-red-200",
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-full ${tones[tone]}`}>
      {children}
    </span>
  );
};

const Section = ({ title, subtitle, children, actions }) => (
  <section className="bg-white/80 backdrop-blur rounded-2xl shadow-xl ring-1 ring-gray-200">
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-gray-100 px-6 py-4">
      <div>
        <h3 className="text-xl font-semibold tracking-tight text-gray-900">{title}</h3>
        {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
    <div className="p-6">{children}</div>
  </section>
);

const Table = ({ children }) => (
  <div className="overflow-hidden rounded-xl border border-gray-200">
    <div className="overflow-x-auto">{children}</div>
  </div>
);

const EmptyState = ({ title, note }) => (
  <div className="flex flex-col items-center justify-center text-center py-16 px-6">
    <div className="text-5xl mb-4">📁</div>
    <h4 className="text-lg font-semibold text-gray-800">{title}</h4>
    {note && <p className="text-sm text-gray-500 mt-1">{note}</p>}
  </div>
);

const Field = ({ children }) => <div className="relative">{children}</div>;

const Input = (props) => (
  <input
    {...props}
    className={`border border-gray-300 focus:border-gray-400 focus:ring-4 focus:ring-gray-100 rounded-xl w-full px-3.5 py-2.5 text-sm transition ${props.className || ""}`}
  />
);

const Select = (props) => (
  <select
    {...props}
    className={`border border-gray-300 focus:border-gray-400 focus:ring-4 focus:ring-gray-100 rounded-xl w-full px-3.5 py-2.5 text-sm bg-white transition ${props.className || ""}`}
  />
);

const Btn = ({ children, tone = "primary", className = "", ...rest }) => {
  const tones = {
    primary:
      "bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 focus:ring-blue-200",
    neutral:
      "bg-gray-100 text-gray-800 hover:bg-gray-200 focus:ring-gray-200",
    warn: "bg-amber-500 text-white hover:bg-amber-600 focus:ring-amber-200",
    danger:
      "bg-red-500 text-white hover:bg-red-600 focus:ring-red-200",
    success:
      "bg-emerald-600 text-white hover:bg-emerald-700 focus:ring-emerald-200",
    outline:
      "bg-white text-gray-800 border border-gray-300 hover:bg-gray-50 focus:ring-gray-200",
  };
  return (
    <button
      {...rest}
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium shadow-sm focus:outline-none focus:ring-4 transition ${tones[tone]} ${className}`}
    >
      {children}
    </button>
  );
};

const BadgeRole = ({ role }) => {
  const map = {
    superAdmin: { tone: "danger", label: "Super Admin" },
    orgAdmin: { tone: "info", label: "Org Admin" },
    deptAdmin: { tone: "warn", label: "Dept Admin" },
    user: { tone: "default", label: "User" },
  };
  const { tone, label } = map[role] ?? map.user;
  return <Pill tone={tone}>{label}</Pill>;
};

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

  // Users under selected org
  const [selectedOrgId, setSelectedOrgId] = useState(null);
  const [users, setUsers] = useState([]);
  const [userLoading, setUserLoading] = useState(false);
  const [userError, setUserError] = useState(null);
  const [newUser, setNewUser] = useState({ name: "", email: "", password: "", role: "user" });
  const [addingUser, setAddingUser] = useState(false);

  useEffect(() => {
    if (!token) navigate("/login");
  }, [token, navigate]);

  const fetchOrgs = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get("/org/", { headers: { Authorization: `Bearer ${token}` } });
      let organizations = res.data.organizations || [];

      if (!["superAdmin", "orgAdmin", "deptAdmin"].includes(user?.role)) {
        const userOrgId = user?.orgId?._id || user?.orgId;
        if (userOrgId && !organizations.find((o) => o._id === userOrgId)) {
          try {
            const orgRes = await api.get(`/org/hierarchy/${userOrgId}`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            if (orgRes.data) organizations = [...organizations, orgRes.data];
          } catch {
            // ignore
          }
        }
      }
      setOrgs(organizations);
    } catch {
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
        await api.put(`/org/${editing}`, payload, { headers: { Authorization: `Bearer ${token}` } });
        setEditing(null);
      } else {
        const res = await api.post("/org/create", payload, { headers: { Authorization: `Bearer ${token}` } });
        if (res.data.joinCode) setJoinCode(res.data.joinCode);
      }
      setForm({ name: "", type: "", parentId: "", deptAdminId: "" });
      fetchOrgs();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to save organization.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this organization?")) return;
    try {
      await api.delete(`/org/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      fetchOrgs();
      if (selectedOrgId === id) {
        setSelectedOrgId(null);
        setUsers([]);
      }
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete organization.");
    }
  };

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

  const handleRegenerateCode = async (orgId) => {
    setRegeneratingId(orgId);
    try {
      const res = await api.post(`/org/${orgId}/generate-code`, {}, { headers: { Authorization: `Bearer ${token}` } });
      alert(`New join code: ${res.data.joinCode}`);
      fetchOrgs();
    } catch {
      alert("Failed to regenerate join code.");
    } finally {
      setRegeneratingId(null);
    }
  };

  const fetchUsers = async (orgId) => {
    setUserLoading(true);
    setUserError(null);
    try {
      const res = await api.get(`/org/${orgId}/users`, { headers: { Authorization: `Bearer ${token}` } });
      setUsers(res.data.users || []);
    } catch {
      setUserError("Failed to load users.");
      setUsers([]);
    } finally {
      setUserLoading(false);
    }
  };

  const handleSelectOrgUsers = (orgId) => {
    setSelectedOrgId(orgId);
    fetchUsers(orgId);
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    if (!selectedOrgId) {
      alert("Please select an organization or department first.");
      return;
    }
    setAddingUser(true);
    try {
      const payload = {
        email: newUser.email,
        requestedRole: newUser.role,
        orgId: selectedOrgId,
        message: "Request to join organization",
        type: "join",
      };
      await api.post("/requests", payload, { headers: { Authorization: `Bearer ${token}` } });
      alert("Request sent to the user for approval.");
      setNewUser({ email: "", role: "user" });
      fetchUsers(selectedOrgId);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to send join request.");
    } finally {
      setAddingUser(false);
    }
  };

  const canManageOrgs = ["superAdmin", "orgAdmin"].includes(user?.role);
  const canManageDept = ["superAdmin", "orgAdmin", "deptAdmin"].includes(user?.role);

  if (loading) {
    return (
      <>
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Loader />
            <p className="text-sm text-gray-500">Preparing your workspace…</p>
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <Section title="Something went wrong">
          <p className="text-red-600">{error}</p>
        </Section>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-50 via-white to-gray-50 p-6">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Header */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-600 text-white">
          <div className="absolute inset-0 bg-[url('https://www.toptal.com/designers/subtlepatterns/uploads/double-bubble-outline.png')] opacity-10" />
          <div className="relative px-8 py-10">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Organization & Department Management
            </h2>
            <p className="text-white/90 mt-1">
              Create, manage, and review your organisational structure and memberships.
            </p>
            <div className="mt-4">
              <Pill tone="success">Signed in as</Pill>{" "}
              <span className="font-medium">{user?.email}</span>{" "}
              <BadgeRole role={user?.role} />
            </div>
          </div>
        </div>

        {/* Create / Edit */}
        {canManageOrgs && (
          <Section
            title={editing ? "Update Organisation / Department" : "Create Organisation / Department"}
            subtitle="Provide basic details. You may optionally set a parent for departments and assign a department admin."
            actions={
              editing && (
                <Btn
                  tone="outline"
                  onClick={() => {
                    setEditing(null);
                    setForm({ name: "", type: "", parentId: "", deptAdminId: "" });
                    setJoinCode(null);
                  }}
                >
                  Cancel edit
                </Btn>
              )
            }
          >
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Field>
                  <Input
                    type="text"
                    placeholder="Organisation / Department Name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                  />
                </Field>

                <Field>
                  <Select
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                    required
                  >
                    <option value="">Select Type</option>
                    <option value="university">University</option>
                    <option value="business">Business</option>
                    <option value="hospital">Hospital</option>
                    <option value="department">Department</option>
                  </Select>
                </Field>

                <Field>
                  <Select
                    value={form.parentId}
                    onChange={(e) => setForm({ ...form, parentId: e.target.value })}
                  >
                    <option value="">Parent (for Departments)</option>
                    {orgs
                      .filter((o) => o.type !== "department")
                      .map((o) => (
                        <option key={o._id} value={o._id}>
                          {o.name} ({o.type})
                        </option>
                      ))}
                  </Select>
                </Field>

                <Field>
                  <Input
                    type="text"
                    placeholder="Dept Admin User ID (optional)"
                    value={form.deptAdminId}
                    onChange={(e) => setForm({ ...form, deptAdminId: e.target.value })}
                  />
                </Field>
              </div>

              <div className="flex items-center gap-3">
                <Btn type="submit">{editing ? "Update" : "Add"}</Btn>
                {joinCode && (
                  <Pill tone="success">New join code: {joinCode}</Pill>
                )}
              </div>
            </form>
          </Section>
        )}

        {/* Organisations Table */}
        <Section
          title="Organisations & Departments"
          subtitle="Browse existing entries, manage access, and view members."
        >
          {orgs.length === 0 ? (
            <EmptyState
              title="No organisations found."
              note={canManageOrgs ? "Use the form above to add your first organisation." : undefined}
            />
          ) : (
            <Table>
              <table className="min-w-full divide-y divide-gray-200 bg-white">
                <thead className="bg-gray-50">
                  <tr className="text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3">Parent</th>
                    {(user?.role === "superAdmin" || user?.role === "orgAdmin") && (
                      <>
                        <th className="px-4 py-3">Join Code</th>
                        <th className="px-4 py-3">Actions</th>
                        <th className="px-4 py-3">Users</th>
                      </>
                    )}
                    {user?.role === "deptAdmin" && <th className="px-4 py-3">Users</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm">
                  {orgs.map((org) => (
                    <tr key={org._id} className="hover:bg-gray-50/60">
                      <td className="px-4 py-3 font-medium text-gray-900">{org.name}</td>
                      <td className="px-4 py-3">
                        <Pill tone="info" >
                          {org.type}
                        </Pill>
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        {org.parentId?.name || "—"}
                      </td>

                      {(user?.role === "superAdmin" || user?.role === "orgAdmin") && (
                        <>
                          <td className="px-4 py-3">
                            {org.joinCode ? (
                              <code className="px-2 py-1 rounded-md bg-gray-100 text-gray-800">
                                {org.joinCode}
                              </code>
                            ) : (
                              <span className="text-gray-400">N/A</span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex flex-wrap items-center gap-2">
                              <Btn tone="warn" onClick={() => handleEdit(org)}>Edit</Btn>
                              <Btn tone="danger" onClick={() => handleDelete(org._id)}>Delete</Btn>
                              <Btn
                                tone="success"
                                disabled={regeneratingId === org._id}
                                onClick={() => handleRegenerateCode(org._id)}
                              >
                                {regeneratingId === org._id ? "Regenerating…" : "Regenerate Code"}
                              </Btn>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <Btn tone="outline" onClick={() => handleSelectOrgUsers(org._id)}>
                              View Users
                            </Btn>
                          </td>
                        </>
                      )}

                      {(user?.role === "deptAdmin" || (!user?.role || user?.role === "user")) && (
                        <td className="px-4 py-3">
                          <Btn
                            tone="outline"
                            onClick={() => handleSelectOrgUsers(org._id)}
                            disabled={!(user?.role === "deptAdmin")}
                            className={!(user?.role === "deptAdmin") ? "opacity-60 cursor-not-allowed" : ""}
                          >
                            View Users
                          </Btn>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </Table>
          )}
        </Section>

        {/* Users under selected org */}
        {selectedOrgId && (
          <Section
            title="Users"
            subtitle="Members associated with the selected organisation / department."
          >
            {userLoading ? (
              <div className="flex items-center gap-3 text-gray-600">
                <Loader />
                <span className="text-sm">Loading users…</span>
              </div>
            ) : userError ? (
              <p className="text-red-600">{userError}</p>
            ) : users.length === 0 ? (
              <EmptyState title="No users found." />
            ) : (
              <Table>
                <table className="min-w-full divide-y divide-gray-200 bg-white">
                  <thead className="bg-gray-50">
                    <tr className="text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                      <th className="px-4 py-3">Name</th>
                      <th className="px-4 py-3">Email</th>
                      <th className="px-4 py-3">Role</th>
                      <th className="px-4 py-3">Organization</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-sm">
                    {users.map((u) => (
                      <tr key={u.id} className="hover:bg-gray-50/60">
                        <td className="px-4 py-3 font-medium text-gray-900">{u.name}</td>
                        <td className="px-4 py-3">{u.email}</td>
                        <td className="px-4 py-3"><BadgeRole role={u.role} /></td>
                        <td className="px-4 py-3">{u.organization || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Table>
            )}

            {(user?.role === "superAdmin" || user?.role === "orgAdmin" || user?.role === "deptAdmin") && (
              <div className="mt-6">
                <div className="rounded-2xl border border-dashed border-gray-300 p-6 bg-gray-50">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Add New User</h4>
                  <form onSubmit={handleAddUser} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <Input
                        type="email"
                        placeholder="Email"
                        value={newUser.email}
                        onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                        required
                        disabled={addingUser}
                      />
                      <Select
                        value={newUser.role}
                        onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                        disabled={addingUser}
                      >
                        <option value="user">User</option>
                        <option value="deptAdmin">Dept Admin</option>
                        <option value="orgAdmin">Org Admin</option>
                        {user.role === "superAdmin" && <option value="superAdmin">Super Admin</option>}
                      </Select>
                      <div className="md:col-span-2 flex items-center">
                        <Btn type="submit" tone="success" disabled={addingUser}>
                          {addingUser ? "Adding…" : "Add User"}
                        </Btn>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500">
                      A join request will be sent to the user for approval.
                    </p>
                  </form>
                </div>
              </div>
            )}
          </Section>
        )}

        <p className="text-center text-xs text-gray-500">
          * Department admins can be set during creation or editing. Join codes are generated automatically. Only authorised admins may perform restricted actions.
        </p>
      </div>
    </div>
  );
};

export default OrgList;
