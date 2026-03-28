import React, { useState, useEffect, useCallback } from "react";
import api from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import Loader from "../components/Loader";

// -----------------------------------------------------
// UI COMPONENTS
// -----------------------------------------------------

const Pill = ({ children, tone = "default", className = "" }) => {
  const tones = {
    default: "bg-gray-100 text-gray-700 ring-1 ring-inset ring-gray-200",
    info: "bg-indigo-50 text-indigo-700 ring-1 ring-inset ring-indigo-200",
    success: "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200",
    warn: "bg-amber-50 text-amber-800 ring-1 ring-inset ring-amber-200",
    danger: "bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-200",
  };
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full shadow-xs backdrop-blur-sm transition-all duration-200 hover:shadow-md hover:scale-[1.03] ${tones[tone]} ${className}`}
    >
      {children}
    </span>
  );
};

const Section = ({ title, subtitle, children, actions }) => (
  <section className="bg-white/90 backdrop-blur-md rounded-3xl shadow-xl ring-1 ring-gray-100">
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-gray-100 px-4 sm:px-8 py-3 sm:py-5">
      <div>
        <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">{title}</h3>
        {subtitle && <p className="text-sm text-slate-500 mt-1">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-3">{actions}</div>}
    </div>
    <div className="p-4 sm:p-8">{children}</div>
  </section>
);

const Table = ({ children }) => (
  <div className="overflow-x-auto rounded-2xl border border-gray-200 shadow-lg bg-white">
    <div className="min-w-full inline-block align-middle">{children}</div>
  </div>
);

const EmptyState = ({ title, note }) => (
  <div className="flex flex-col items-center justify-center text-center py-12 sm:py-20 px-4 text-slate-600 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50">
    <div className="text-5xl sm:text-6xl mb-4">✨</div>
    <h4 className="text-xl font-semibold text-slate-800">{title}</h4>
    {note && <p className="text-sm text-slate-500 mt-2">{note}</p>}
  </div>
);

const Field = ({ label, children }) => (
  <div className="relative">
    {children}
    <label className="absolute top-0 left-3 px-1.5 py-0.5 text-xs font-medium text-slate-500 bg-white transition-all duration-200 transform -translate-y-2 pointer-events-none">
      {label}
    </label>
  </div>
);

const Input = (props) => (
  <input
    {...props}
    className={`border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 rounded-xl w-full px-4 py-3 text-sm transition placeholder:text-slate-400 ${props.className || ""}`}
    placeholder={props.placeholder || " "}
  />
);

const Select = (props) => (
  <select
    {...props}
    className={`border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 rounded-xl w-full px-4 py-3 text-sm bg-white transition appearance-none cursor-pointer ${props.className || ""}`}
  />
);

const Btn = ({ children, tone = "primary", className = "", ...rest }) => {
  const tones = {
    primary: "bg-gradient-to-br from-indigo-500 to-indigo-700 text-white hover:from-indigo-600 hover:to-indigo-800 focus:ring-indigo-300 shadow-md hover:shadow-lg",
    neutral: "bg-gray-200 text-slate-800 hover:bg-gray-300 focus:ring-gray-300 shadow-sm",
    warn: "bg-amber-500 text-white hover:bg-amber-600 focus:ring-amber-200 shadow-md",
    danger: "bg-rose-500 text-white hover:bg-rose-600 focus:ring-rose-200 shadow-md",
    success: "bg-emerald-500 text-white hover:bg-emerald-600 focus:ring-emerald-200 shadow-md",
    outline: "bg-white text-slate-700 border border-gray-300 hover:bg-gray-50 focus:ring-gray-200 shadow-sm",
  };
  return (
    <button
      {...rest}
      className={`inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold focus:outline-none focus:ring-4 transition duration-200 transform active:scale-[0.98] whitespace-nowrap ${tones[tone]} ${className}`}
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
  return <Pill tone={tone} className="text-xs uppercase tracking-wider">{label}</Pill>;
};

// Inline toast instead of alert()
const Toast = ({ message, tone = "success", onClose }) => {
  if (!message) return null;
  const tones = {
    success: "bg-emerald-50 border-emerald-200 text-emerald-800",
    danger: "bg-rose-50 border-rose-200 text-rose-800",
    info: "bg-indigo-50 border-indigo-200 text-indigo-800",
  };
  return (
    <div className={`flex items-center justify-between gap-3 px-4 py-3 rounded-xl border text-sm font-medium ${tones[tone]}`}>
      <span>{message}</span>
      <button onClick={onClose} className="opacity-60 hover:opacity-100 transition text-lg leading-none">&times;</button>
    </div>
  );
};

// -----------------------------------------------------
// ORGLIST COMPONENT
// -----------------------------------------------------

const OrgList = () => {
  // ✅ Fix 1: Use isAuthenticated instead of token for auth check
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [orgs, setOrgs] = useState([]);
  const [form, setForm] = useState({ name: "", type: "", parentId: "", deptAdminId: "" });
  const [editing, setEditing] = useState(null);
  const [joinCode, setJoinCode] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [regeneratingId, setRegeneratingId] = useState(null);

  // ✅ Fix 2: Inline toast state instead of alert()
  const [toast, setToast] = useState(null);
  const showToast = (message, tone = "success") => {
    setToast({ message, tone });
    setTimeout(() => setToast(null), 4000);
  };

  const [selectedOrgId, setSelectedOrgId] = useState(null);
  const [users, setUsers] = useState([]);
  const [userLoading, setUserLoading] = useState(false);
  const [userError, setUserError] = useState(null);
  const [newUser, setNewUser] = useState({ email: "", role: "user" });
  const [addingUser, setAddingUser] = useState(false);
  const selectedOrg = orgs.find((o) => o._id === selectedOrgId);

  // ✅ Fix 1: Redirect to /auth (not /login)
  useEffect(() => {
    if (!isAuthenticated) navigate("/auth");
  }, [isAuthenticated, navigate]);

  // ✅ Fix 3: useCallback so fetchOrgs is stable and can be used as dependency
  const fetchOrgs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // ✅ Fix 4: No manual Authorization header — api.js interceptor handles it
      const res = await api.get("/org/");
      let organizations = res.data.organizations || [];

      if (!["superAdmin", "orgAdmin", "deptAdmin"].includes(user?.role)) {
        const userOrgId = user?.orgId?._id || user?.orgId;
        if (userOrgId && !organizations.some((o) => o._id === userOrgId)) {
          try {
            const orgRes = await api.get(`/org/hierarchy/${userOrgId}`);
            if (orgRes.data && !organizations.some((o) => o._id === orgRes.data._id)) {
              organizations = [...organizations, orgRes.data];
            }
          } catch {
            // ignore — user may not have an org yet
          }
        }
      }
      setOrgs(organizations);
    } catch {
      setError("Failed to load organizations. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [user?.role, user?.orgId]);

  // ✅ Fix 5: Depend on isAuthenticated, not token
  useEffect(() => {
    if (isAuthenticated) {
      fetchOrgs();
      setJoinCode(null);
      setSelectedOrgId(null);
      setUsers([]);
    }
  }, [isAuthenticated, fetchOrgs]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setJoinCode(null);

    if (!form.name || !form.type) {
      showToast("Name and Type are required.", "danger");
      return;
    }

    const payload = {
      name: form.name.trim(),
      type: form.type,
      parentId: form.parentId.trim() === "" ? null : form.parentId,
      deptAdminId: form.deptAdminId.trim() === "" ? null : form.deptAdminId,
    };

    try {
      if (editing) {
        // ✅ Fix 4: No manual Authorization headers
        await api.put(`/org/${editing}`, payload);
        setEditing(null);
        showToast(`Organization "${payload.name}" updated successfully!`);
      } else {
        const res = await api.post("/org/create", payload);
        if (res.data.joinCode) setJoinCode(res.data.joinCode);
        showToast(`Organization "${payload.name}" created successfully!`);
      }
      setForm({ name: "", type: "", parentId: "", deptAdminId: "" });
      fetchOrgs();
    } catch (err) {
      showToast(err.response?.data?.message || `Failed to ${editing ? "update" : "create"} organization.`, "danger");
    }
  };

  const handleDelete = async (id) => {
    const org = orgs.find((o) => o._id === id);
    if (!window.confirm(`Are you sure you want to delete "${org?.name}"? This action is irreversible.`)) return;
    try {
      await api.delete(`/org/${id}`);
      fetchOrgs();
      if (selectedOrgId === id) {
        setSelectedOrgId(null);
        setUsers([]);
      }
      showToast(`Organization "${org?.name}" deleted successfully.`);
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to delete organization.", "danger");
    }
  };

  const handleEdit = (org) => {
    setJoinCode(null);
    setForm({
      name: org.name || "",
      type: org.type || "",
      parentId: org.parentId?._id || org.parentId || "",
      deptAdminId: org.admin?._id || org.admin || "",
    });
    setEditing(org._id);
  };

  const handleRegenerateCode = async (orgId) => {
    setRegeneratingId(orgId);
    try {
      const res = await api.post(`/org/${orgId}/generate-code`, {});
      const newCode = res.data.joinCode;
      navigator.clipboard.writeText(newCode).catch(() => {});
      showToast(`New join code: ${newCode} (copied to clipboard)`);
      fetchOrgs();
    } catch {
      showToast("Failed to regenerate join code.", "danger");
    } finally {
      setRegeneratingId(null);
    }
  };

  const fetchUsers = async (orgId) => {
    setUserLoading(true);
    setUserError(null);
    try {
      const res = await api.get(`/org/${orgId}/users`);
      setUsers(res.data.users || []);
    } catch {
      setUserError("Failed to load users for this organization.");
      setUsers([]);
    } finally {
      setUserLoading(false);
    }
  };

  // ✅ Fix 6: Removed onClick from <tr> — only button triggers this
  const handleSelectOrgUsers = (orgId) => {
    if (selectedOrgId === orgId) {
      setSelectedOrgId(null);
      setUsers([]);
    } else {
      setSelectedOrgId(orgId);
      fetchUsers(orgId);
    }
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    if (!selectedOrgId) {
      showToast("Please select an organization first.", "danger");
      return;
    }
    setAddingUser(true);
    try {
      const payload = {
        email: newUser.email,
        requestedRole: newUser.role,
        orgId: selectedOrgId,
        message: `Request to join ${selectedOrg?.name || "organization"}`,
        type: "join",
      };
      await api.post("/requests", payload);
      showToast(`Join request sent to ${newUser.email} for approval.`);
      setNewUser({ email: "", role: "user" });
      fetchUsers(selectedOrgId);
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to send join request.", "danger");
    } finally {
      setAddingUser(false);
    }
  };

  const canManageOrgs = ["superAdmin", "orgAdmin"].includes(user?.role);
  const canManageMembers = ["superAdmin", "orgAdmin", "deptAdmin"].includes(user?.role);

  if (loading) return <Loader size="lg" />;

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6 bg-gray-50">
        <Section title="Error Loading Data" subtitle="An issue occurred while fetching organization data.">
          <p className="text-lg text-rose-600 font-medium">{error}</p>
          <Btn tone="primary" onClick={fetchOrgs} className="mt-4">Retry Load</Btn>
        </Section>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-50 via-white to-gray-100 p-4 sm:p-8">
      <div className="mx-auto max-w-7xl space-y-6 sm:space-y-10">

        {/* Header */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-tr from-indigo-700 via-slate-800 to-cyan-700 text-white shadow-2xl">
          <div className="absolute inset-0 bg-[url('https://www.toptal.com/designers/subtlepatterns/uploads/double-bubble-outline.png')] opacity-10" />
          <div className="relative px-6 py-8 sm:px-10 sm:py-12">
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tighter drop-shadow-md">
              Organizational Console
            </h2>
            <p className="text-white/80 mt-2 text-base sm:text-lg max-w-2xl">
              Centralized management for your organizational structure, departments, and user membership.
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-3 sm:gap-4">
              <Pill tone="success" className="text-xs">Active Session</Pill>
              <span className="font-semibold text-white/95">{user?.email}</span>
              <div className="ml-2"><BadgeRole role={user?.role} /></div>
            </div>
          </div>
        </div>

        {/* ✅ Global toast — replaces all alert() calls */}
        {toast && (
          <Toast message={toast.message} tone={toast.tone} onClose={() => setToast(null)} />
        )}

        {/* Create / Edit Form */}
        {canManageOrgs && (
          <Section
            title={editing ? "Update Entry" : "Create New Entry"}
            subtitle={editing ? `Editing: ${form.name}` : "Define a new organization or department within the hierarchy."}
            actions={
              editing && (
                <Btn
                  tone="neutral"
                  onClick={() => {
                    setEditing(null);
                    setForm({ name: "", type: "", parentId: "", deptAdminId: "" });
                    setJoinCode(null);
                  }}
                >
                  <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Cancel
                </Btn>
              )
            }
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                <Field label="Name">
                  <Input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                  />
                </Field>
                <Field label="Type">
                  <Select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} required>
                    <option value="" disabled>Select Type</option>
                    <option value="university">University</option>
                    <option value="business">Business</option>
                    <option value="hospital">Hospital</option>
                    <option value="department">Department</option>
                  </Select>
                </Field>
                <Field label="Parent (Optional)">
                  <Select value={form.parentId} onChange={(e) => setForm({ ...form, parentId: e.target.value })}>
                    <option value="">No Parent</option>
                    {orgs.filter((o) => o._id !== editing).map((o) => (
                      <option key={o._id} value={o._id}>{o.name} ({o.type})</option>
                    ))}
                  </Select>
                </Field>
                <Field label="Dept Admin User ID (Optional)">
                  <Input
                    type="text"
                    value={form.deptAdminId}
                    onChange={(e) => setForm({ ...form, deptAdminId: e.target.value })}
                  />
                </Field>
              </div>

              <div className="flex flex-wrap items-center gap-4 pt-2 border-t border-gray-100">
                <Btn type="submit" className="w-full sm:w-auto">
                  <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                  {editing ? "Update Entry" : "Create Entry"}
                </Btn>
                {/* ✅ Fix 7: No markdown **asterisks** in JSX */}
                {joinCode && (
                  <Pill tone="success" className="text-sm">
                    New Join Code: <strong className="ml-1">{joinCode}</strong>
                  </Pill>
                )}
              </div>
            </form>
          </Section>
        )}

        {/* Organisations Table */}
        <Section title="Organizational Hierarchy" subtitle="View all entries and manage their permissions and actions.">
          {orgs.length === 0 ? (
            <EmptyState
              title="No entries found."
              note={canManageOrgs ? "Start by adding the top-level organization using the form above." : "You are not associated with any organizations."}
            />
          ) : (
            <Table>
              <table className="min-w-full divide-y divide-gray-200 bg-white">
                <thead className="bg-gray-50 sticky top-0 z-10 shadow-sm border-b border-gray-200">
                  <tr className="text-left text-xs font-bold uppercase tracking-wider text-slate-600">
                    <th className="px-4 py-3 sm:px-6">Name</th>
                    <th className="px-4 py-3 sm:px-6">Type</th>
                    <th className="px-4 py-3 sm:px-6 hidden md:table-cell">Parent</th>
                    <th className="px-4 py-3 sm:px-6 hidden lg:table-cell">Admin ID</th>
                    {(user?.role === "superAdmin" || user?.role === "orgAdmin") && (
                      <>
                        <th className="px-4 py-3 sm:px-6 whitespace-nowrap">Join Code</th>
                        <th className="px-4 py-3 sm:px-6 whitespace-nowrap">Actions</th>
                      </>
                    )}
                    <th className="px-4 py-3 sm:px-6 whitespace-nowrap">Members</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm">
                  {orgs.map((org, index) => (
                    // ✅ Fix 6: Removed onClick from <tr> to prevent double-fire
                    <tr
                      key={org._id}
                      className={`${index % 2 === 0 ? "bg-white" : "bg-gray-50/50"} hover:bg-indigo-50/50 transition-colors`}
                    >
                      <td className="px-4 py-3 sm:px-6 font-semibold text-slate-900 whitespace-nowrap text-sm">{org.name}</td>
                      <td className="px-4 py-3 sm:px-6">
                        <Pill tone="info" className="text-[11px] uppercase">{org.type}</Pill>
                      </td>
                      <td className="px-4 py-3 sm:px-6 text-slate-700 hidden md:table-cell whitespace-nowrap text-sm">{org.parentId?.name || "—"}</td>
                      <td className="px-4 py-3 sm:px-6 text-slate-500 hidden lg:table-cell whitespace-nowrap text-xs">{org.admin?._id || org.admin || "—"}</td>

                      {(user?.role === "superAdmin" || user?.role === "orgAdmin") && (
                        <>
                          <td className="px-4 py-3 sm:px-6 whitespace-nowrap">
                            {org.joinCode ? (
                              <code className="px-2 py-1 rounded-lg bg-gray-100 border border-gray-200 text-slate-700 text-xs shadow-inner">{org.joinCode}</code>
                            ) : (
                              <span className="text-slate-400 text-xs">N/A</span>
                            )}
                          </td>
                          <td className="px-4 py-3 sm:px-6">
                            <div className="flex flex-col sm:flex-row items-stretch gap-2">
                              <Btn tone="neutral" onClick={() => handleEdit(org)} className="p-1.5 sm:p-2 text-xs">Edit</Btn>
                              <Btn tone="danger" onClick={() => handleDelete(org._id)} className="p-1.5 sm:p-2 text-xs">Delete</Btn>
                              <Btn
                                tone="success"
                                disabled={regeneratingId === org._id}
                                onClick={() => handleRegenerateCode(org._id)}
                                className="p-1.5 sm:p-2 text-xs"
                              >
                                {regeneratingId === org._id ? "Generating..." : "Regen Code"}
                              </Btn>
                            </div>
                          </td>
                        </>
                      )}

                      <td className="px-4 py-3 sm:px-6">
                        <Btn
                          tone={selectedOrgId === org._id ? "primary" : "outline"}
                          onClick={() => handleSelectOrgUsers(org._id)}
                          className="p-1.5 sm:p-2 text-xs"
                        >
                          {selectedOrgId === org._id ? "Hide Members" : "View Members"}
                        </Btn>
                      </td>
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
            title={`Members of ${selectedOrg?.name || "Selected Entity"}`}
            subtitle={`Listing users currently associated with ${selectedOrg?.name || "the entity"}.`}
          >
            {userLoading ? (
              <div className="flex items-center gap-3 text-slate-600 py-6">
                <span className="text-sm">Fetching member list…</span>
              </div>
            ) : userError ? (
              <p className="text-rose-600 font-medium">{userError}</p>
            ) : users.length === 0 ? (
              <EmptyState title="No members found." note="Use the form below to invite the first user." />
            ) : (
              <Table>
                <table className="min-w-full divide-y divide-gray-200 bg-white">
                  <thead className="bg-gray-50 sticky top-0 z-10 shadow-sm border-b border-gray-200">
                    <tr className="text-left text-xs font-bold uppercase tracking-wider text-slate-600">
                      <th className="px-4 py-3 sm:px-6">Name</th>
                      <th className="px-4 py-3 sm:px-6">Email</th>
                      <th className="px-4 py-3 sm:px-6">Role</th>
                      <th className="px-4 py-3 sm:px-6 hidden sm:table-cell">Organization</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-sm">
                    {users.map((u, index) => (
                      // ✅ Fix 8: Use _id || id for MongoDB compatibility
                      <tr key={u._id || u.id} className={`${index % 2 === 0 ? "bg-white" : "bg-gray-50/50"} hover:bg-indigo-50/50 transition-colors`}>
                        <td className="px-4 py-3 sm:px-6 font-medium text-slate-900 whitespace-nowrap text-sm">{u.name}</td>
                        <td className="px-4 py-3 sm:px-6 text-sm text-slate-700">{u.email}</td>
                        <td className="px-4 py-3 sm:px-6"><BadgeRole role={u.role} /></td>
                        <td className="px-4 py-3 sm:px-6 hidden sm:table-cell text-sm text-slate-700">{u.organization || selectedOrg?.name || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Table>
            )}

            {canManageMembers && (
              <div className="mt-8">
                <div className="rounded-2xl border border-dashed border-indigo-200 p-4 sm:p-6 bg-indigo-50/50">
                  <h4 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                    Invite New Member
                  </h4>
                  <form onSubmit={handleAddUser} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="md:col-span-2">
                        <Field label="User Email">
                          <Input
                            type="email"
                            value={newUser.email}
                            onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                            required
                            disabled={addingUser}
                          />
                        </Field>
                      </div>
                      <Field label="Assign Role">
                        <Select value={newUser.role} onChange={(e) => setNewUser({ ...newUser, role: e.target.value })} disabled={addingUser}>
                          <option value="user">User</option>
                          <option value="deptAdmin">Dept Admin</option>
                          {user?.role === "superAdmin" && <option value="orgAdmin">Org Admin</option>}
                          {user?.role === "superAdmin" && <option value="superAdmin">Super Admin</option>}
                        </Select>
                      </Field>
                      <div className="flex items-end">
                        <Btn type="submit" tone="primary" disabled={addingUser} className="w-full">
                          <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                          </svg>
                          {addingUser ? "Sending…" : "Send Invite"}
                        </Btn>
                      </div>
                    </div>
                    {/* ✅ Fix 7: No **markdown** in JSX — use <strong> */}
                    <p className="text-xs text-indigo-700 font-medium mt-2">
                      The user will receive an email to accept the join request for{" "}
                      <strong>{selectedOrg?.name || "the entity"}</strong> with the specified role.
                    </p>
                  </form>
                </div>
              </div>
            )}
          </Section>
        )}

        {/* ✅ Fix 7: No **markdown** in JSX */}
        <p className="text-center text-xs text-slate-500 pt-6 border-t border-gray-200">
          <strong>Data Security Notice:</strong> All administrative actions are logged. Only authorized administrators (
          <strong>Super Admin</strong> or <strong>Org Admin</strong>) can create/modify top-level entries and regenerate codes.
        </p>
      </div>
    </div>
  );
};

export default OrgList;