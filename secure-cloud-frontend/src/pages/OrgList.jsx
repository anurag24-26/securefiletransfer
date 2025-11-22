import React, { useState, useEffect } from "react";
import api from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import Loader from "../components/Loader";
// -----------------------------------------------------
// 🎨 UI IMPROVEMENTS
// -----------------------------------------------------

// 1. Refined Pill/Badge with hover for interactivity
const Pill = ({ children, tone = "default", className = "" }) => {
  const tones = {
    default: "bg-gray-100 text-gray-700 ring-1 ring-inset ring-gray-200", // Slightly darker text
    info: "bg-indigo-50 text-indigo-700 ring-1 ring-inset ring-indigo-200",
    success: "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200",
    warn: "bg-amber-50 text-amber-800 ring-1 ring-inset ring-amber-200",
    danger: "bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-200",
  };
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full shadow-xs backdrop-blur-sm transition-all duration-200 hover:shadow-md hover:scale-[1.03] ${tones[tone]} ${className}`}
      aria-hidden="true"
    >
      {children}
    </span>
  );
};

// 2. Refined Section for softer, premium feel
const Section = ({ title, subtitle, children, actions }) => (
  <section className="bg-white/90 backdrop-blur-md rounded-3xl shadow-xl ring-1 ring-gray-100"> {/* Softer background, larger shadow */}
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-gray-100 px-4 sm:px-8 py-3 sm:py-5"> {/* Increased padding */}
      <div>
        <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">{title}</h3> {/* Bolder title */}
        {subtitle && <p className="text-sm text-slate-500 mt-1">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-3">{actions}</div>} {/* Slightly larger gap */}
    </div>
    <div className="p-4 sm:p-8">{children}</div> {/* Increased padding */}
  </section>
);

// 3. Table with subtle borders and improved structure for responsiveness
const Table = ({ children }) => (
  <div className="overflow-x-auto rounded-2xl border border-gray-200 shadow-lg bg-white"> {/* Better border/shadow */}
    <div className="min-w-full inline-block align-middle">{children}</div>
  </div>
);

// 4. More engaging Empty State
const EmptyState = ({ title, note }) => (
  <div className="flex flex-col items-center justify-center text-center py-12 sm:py-20 px-4 text-slate-600 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50">
    <div className="text-5xl sm:text-6xl mb-4" aria-hidden>
      ✨
    </div>
    <h4 className="text-xl font-semibold text-slate-800">{title}</h4>
    {note && <p className="text-sm text-slate-500 mt-2">{note}</p>}
  </div>
);

// 5. Floating Label Field for better UX (Key Improvement!)
const Field = ({ label, children }) => (
    <div className="relative">
        {children}
        <label
            className="absolute top-0 left-3 px-1.5 py-0.5 text-xs font-medium text-slate-500 bg-white transition-all duration-200 transform -translate-y-2 pointer-events-none"
        >
            {label}
        </label>
    </div>
);

// 6. Input with cleaner focus state
const Input = (props) => (
  <input
    {...props}
    className={`border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 rounded-xl w-full px-4 py-3 text-sm transition placeholder:text-slate-400 ${props.className || ""}`} // Larger padding, sharper focus ring
    placeholder={props.placeholder || " "} // Required for floating label
  />
);

// 7. Select with cleaner focus state
const Select = (props) => (
  <select
    {...props}
    className={`border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 rounded-xl w-full px-4 py-3 text-sm bg-white transition appearance-none cursor-pointer ${props.className || ""}`} // Larger padding, sharper focus ring, removed default arrow (via appearance-none)
  />
);

// 8. Btn with smoother transitions and better color tones
const Btn = ({ children, tone = "primary", className = "", icon: Icon, ...rest }) => {
  const tones = {
    primary:
      "bg-gradient-to-br from-indigo-500 to-indigo-700 text-white hover:from-indigo-600 hover:to-indigo-800 focus:ring-indigo-300 shadow-md hover:shadow-lg", // Deeper gradient, better shadow
    neutral: "bg-gray-200 text-slate-800 hover:bg-gray-300 focus:ring-gray-300 shadow-sm",
    warn: "bg-amber-500 text-white hover:bg-amber-600 focus:ring-amber-200 shadow-md",
    danger: "bg-rose-500 text-white hover:bg-rose-600 focus:ring-rose-200 shadow-md",
    success: "bg-emerald-500 text-white hover:bg-emerald-600 focus:ring-emerald-200 shadow-md",
    outline:
      "bg-white text-slate-700 border border-gray-300 hover:bg-gray-50 focus:ring-gray-200 shadow-sm", // Brighter text, clearer hover
  };
  return (
    <button
      {...rest}
      className={`inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold focus:outline-none focus:ring-4 transition duration-200 transform active:scale-[0.98] whitespace-nowrap ${tones[tone]} ${className}`} // Smoother transition, better active state, removed smaller mobile text/padding (let button grow)
    >
      {children}
    </button>
  );
};

// 9. Simplified BadgeRole component
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

// -----------------------------------------------------
// 💻 ORG LIST COMPONENT
// -----------------------------------------------------

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
  const [newUser, setNewUser] = useState({ name: "", email: "", role: "user" }); // Removed password as it's not used in payload
  const [addingUser, setAddingUser] = useState(false);
  const selectedOrg = orgs.find(o => o._id === selectedOrgId); // Added for dynamic section title

  useEffect(() => {
    if (!token) navigate("/login");
  }, [token, navigate]);

  const fetchOrgs = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get("/org/", { headers: { Authorization: `Bearer ${token}` } });
      let organizations = res.data.organizations || [];

      // Logic to fetch user's own org/hierarchy if not in the main list (improved data consistency)
      if (!["superAdmin", "orgAdmin", "deptAdmin"].includes(user?.role)) {
        const userOrgId = user?.orgId?._id || user?.orgId;
        if (userOrgId && !organizations.some((o) => o._id === userOrgId)) {
          try {
            const orgRes = await api.get(`/org/hierarchy/${userOrgId}`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            // Ensure we don't duplicate if hierarchy somehow returns an existing org
            if (orgRes.data && !organizations.some(o => o._id === orgRes.data._id)) {
                organizations = [...organizations, orgRes.data];
            }
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setJoinCode(null);

    // Minor validation improvement
    if (!form.name || !form.type) {
        alert("Name and Type are required.");
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
        await api.put(`/org/${editing}`, payload, { headers: { Authorization: `Bearer ${token}` } });
        setEditing(null);
        alert(`Organization "${payload.name}" updated successfully!`);
      } else {
        const res = await api.post("/org/create", payload, { headers: { Authorization: `Bearer ${token}` } });
        if (res.data.joinCode) setJoinCode(res.data.joinCode);
        alert(`Organization "${payload.name}" created successfully!`);
      }
      setForm({ name: "", type: "", parentId: "", deptAdminId: "" });
      fetchOrgs();
    } catch (err) {
      alert(err.response?.data?.message || `Failed to ${editing ? 'update' : 'create'} organization.`);
    }
  };

  const handleDelete = async (id) => {
    const org = orgs.find(o => o._id === id);
    if (!window.confirm(`Are you sure you want to delete "${org?.name}"? This action is irreversible.`)) return;
    try {
      await api.delete(`/org/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      fetchOrgs();
      if (selectedOrgId === id) {
        setSelectedOrgId(null);
        setUsers([]);
      }
      alert(`Organization "${org?.name}" deleted successfully.`);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete organization.");
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
    setEditing(org._id); // Set editing last to trigger potential UI changes smoothly
  };

  const handleRegenerateCode = async (orgId) => {
    setRegeneratingId(orgId);
    try {
      const res = await api.post(`/org/${orgId}/generate-code`, {}, { headers: { Authorization: `Bearer ${token}` } });
      const newCode = res.data.joinCode;
      alert(`New join code: ${newCode} (Copied to clipboard).`);
      navigator.clipboard.writeText(newCode).catch(() => console.error("Failed to copy code."));
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
      setUserError("Failed to load users for this organization.");
      setUsers([]);
    } finally {
      setUserLoading(false);
    }
  };

  const handleSelectOrgUsers = (orgId) => {
    // Toggle functionality
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
      alert("Please select an organization or department first.");
      return;
    }
    setAddingUser(true);
    try {
      const payload = {
        email: newUser.email,
        requestedRole: newUser.role,
        orgId: selectedOrgId,
        message: `Request to join ${selectedOrg?.name || 'organization'}`,
        type: "join",
      };
      await api.post("/requests", payload, { headers: { Authorization: `Bearer ${token}` } });
      alert(`A join request has been successfully sent to ${newUser.email} for approval.`);
      setNewUser({ email: "", role: "user" });
      fetchUsers(selectedOrgId); // Refresh user list after sending request
    } catch (err) {
      alert(err.response?.data?.message || "Failed to send join request. Check if user already exists or if email is valid.");
    } finally {
      setAddingUser(false);
    }
  };

  const canManageOrgs = ["superAdmin", "orgAdmin"].includes(user?.role);
  const canManageMembers = ["superAdmin", "orgAdmin", "deptAdmin"].includes(user?.role); // Control for user add form

  if (loading) {
    return (
     
          <Loader size="lg" />
         
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6 bg-gray-50">
        <Section title="Error Loading Data" subtitle="An issue occurred while fetching organization data.">
          <p className="text-lg text-rose-600 font-medium">{error}</p>
          <Btn tone="primary" onClick={fetchOrgs} className="mt-4">
            Retry Load
          </Btn>
        </Section>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-50 via-white to-gray-100 p-4 sm:p-8"> {/* Increased spacing */}
      <div className="mx-auto max-w-7xl space-y-6 sm:space-y-10"> {/* Increased spacing */}
        
        {/* Header (More Premium Look) */}
        <div className="relative overflow-hidden rounded-3xl sm:rounded-4xl bg-gradient-to-tr from-indigo-700 via-slate-800 to-cyan-700 text-white shadow-2xl"> {/* Deeper, richer gradient */}
          <div
            className="absolute inset-0 bg-[url('https://www.toptal.com/designers/subtlepatterns/uploads/double-bubble-outline.png')] opacity-10"
            aria-hidden
          />
          <div className="relative px-6 py-8 sm:px-10 sm:py-12"> {/* Larger padding */}
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tighter drop-shadow-md">
              Organizational Console
            </h2>
            <p className="text-white/80 mt-2 text-base sm:text-lg max-w-2xl">
              Centralized management for your organizational structure, including organizations, departments, and user membership.
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-3 sm:gap-4">
              <Pill tone="success" className="text-xs">Active Session</Pill>
              <span className="font-semibold text-white/95 text-md">{user?.email}</span>
              <div className="ml-2">
                <BadgeRole role={user?.role} />
              </div>
            </div>
          </div>
        </div>

        {/* Create / Edit Form (Floating Labels & Better Grid) */}
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
                  className="w-full sm:w-auto"
                >
                  <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                  Cancel
                </Btn>
              )
            }
          >
            <form onSubmit={handleSubmit} className="space-y-6"> {/* Increased spacing */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6"> {/* Larger grid gap */}
                
                {/* Name */}
                <Field label="Name">
                  <Input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                  />
                </Field>

                {/* Type */}
                <Field label="Type">
                  <Select
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                    required
                  >
                    <option value="" disabled>Select Type</option>
                    <option value="university">University</option>
                    <option value="business">Business</option>
                    <option value="hospital">Hospital</option>
                    <option value="department">Department</option>
                  </Select>
                </Field>

                {/* Parent ID */}
                <Field label="Parent (Optional)">
                  <Select
                    value={form.parentId}
                    onChange={(e) => setForm({ ...form, parentId: e.target.value })}
                  >
                    <option value="">No Parent</option>
                    {orgs
                      .filter((o) => o._id !== editing) // Cannot be own parent
                      .map((o) => (
                        <option key={o._id} value={o._id}>
                          {o.name} ({o.type})
                        </option>
                      ))}
                  </Select>
                </Field>

                {/* Dept Admin ID */}
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
                    <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
                    {editing ? "Update Entry" : "Create Entry"}
                </Btn>
                {joinCode && <Pill tone="success" className="text-sm">🔑 New Join Code: **{joinCode}**</Pill>} {/* Enhanced emphasis */}
              </div>
            </form>
          </Section>
        )}

        {/* Organisations Table (Zebra Stripes & Sticky Header) */}
        <Section title="Organizational Hierarchy" subtitle="View all entries and manage their permissions and actions.">
          {orgs.length === 0 ? (
            <EmptyState title="No entries found." note={canManageOrgs ? "Start by adding the top-level organization using the form above." : "You are not associated with any organizations."} />
          ) : (
            <Table>
              <table className="min-w-full divide-y divide-gray-200 bg-white">
                <thead className="bg-gray-50 sticky top-0 z-10 shadow-sm border-b border-gray-200"> {/* Sticky Header for better mobile UX */}
                  <tr className="text-left text-xs font-bold uppercase tracking-wider text-slate-600">
                    <th className="px-4 py-3 sm:px-6">Name</th> {/* Increased padding */}
                    <th className="px-4 py-3 sm:px-6">Type</th>
                    <th className="px-4 py-3 sm:px-6 hidden md:table-cell">Parent</th> {/* Hide on small/medium screens */}
                    <th className="px-4 py-3 sm:px-6 hidden lg:table-cell">Admin ID</th> {/* Hide until large screens */}
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
                    // Zebra Striping for readability
                    <tr key={org._id} className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'} hover:bg-indigo-50/50 transition-colors cursor-pointer`} onClick={() => handleSelectOrgUsers(org._id)}>
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
                              <Btn tone="neutral" onClick={(e) => { e.stopPropagation(); handleEdit(org); }} className="w-full sm:w-auto p-1.5 sm:p-2 text-xs">
                                Edit
                              </Btn>
                              <Btn tone="danger" onClick={(e) => { e.stopPropagation(); handleDelete(org._id); }} className="w-full sm:w-auto p-1.5 sm:p-2 text-xs">
                                Delete
                              </Btn>
                              <Btn tone="success" disabled={regeneratingId === org._id} onClick={(e) => { e.stopPropagation(); handleRegenerateCode(org._id); }} className="w-full sm:w-auto p-1.5 sm:p-2 text-xs">
                                {regeneratingId === org._id ? "Generating..." : "🔑 Regen. Code"}
                              </Btn>
                            </div>
                          </td>
                        </>
                      )}

                      {/* Members Column (Always Visible) */}
                      <td className="px-4 py-3 sm:px-6">
                          <Btn 
                            tone={selectedOrgId === org._id ? "primary" : "outline"} 
                            onClick={(e) => { e.stopPropagation(); handleSelectOrgUsers(org._id); }}
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

        {/* Users under selected org (Dynamic Title, Better Add User Form) */}
        {selectedOrgId && (
          <Section 
            title={`Members of ${selectedOrg?.name || 'Selected Entity'}`} 
            subtitle={`Listing users currently associated with ${selectedOrg?.name || 'the entity'}.`}
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
                      <tr key={u.id} className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'} hover:bg-indigo-50/50 transition-colors`}>
                        <td className="px-4 py-3 sm:px-6 font-medium text-slate-900 whitespace-nowrap text-sm">{u.name}</td>
                        <td className="px-4 py-3 sm:px-6 text-sm text-slate-700">{u.email}</td>
                        <td className="px-4 py-3 sm:px-6">
                          <BadgeRole role={u.role} />
                        </td>
                        <td className="px-4 py-3 sm:px-6 hidden sm:table-cell text-sm text-slate-700">{u.organization || selectedOrg?.name || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Table>
            )}

            {canManageMembers && (
              <div className="mt-8">
                <div className="rounded-2xl border border-dashed border-indigo-200 p-4 sm:p-6 bg-indigo-50/50"> {/* More thematic invite section */}
                  <h4 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                    Invite New Member 📧
                  </h4>
                  <form onSubmit={handleAddUser} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      
                      {/* Email Input */}
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

                      {/* Role Select */}
                      <Field label="Assign Role">
                        <Select value={newUser.role} onChange={(e) => setNewUser({ ...newUser, role: e.target.value })} disabled={addingUser}>
                          <option value="user">User</option>
                          <option value="deptAdmin">Dept Admin</option>
                          {user.role === "superAdmin" && <option value="orgAdmin">Org Admin</option>}
                          {user.role === "superAdmin" && <option value="superAdmin">Super Admin</option>}
                        </Select>
                      </Field>
                      
                      {/* Action Button */}
                      <div className="flex items-end">
                        <Btn type="submit" tone="primary" disabled={addingUser} className="w-full">
                          <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" /></svg>
                          {addingUser ? "Sending…" : "Send Invite"}
                        </Btn>
                      </div>
                    </div>
                    <p className="text-xs text-indigo-700 font-medium mt-2">The user will receive an email to accept the join request for **{selectedOrg?.name || 'the entity'}** with the specified role.</p>
                  </form>
                </div>
              </div>
            )}
          </Section>
        )}

        <p className="text-center text-xs text-slate-500 pt-6 border-t border-gray-200">
          **Data Security Notice:** All administrative actions are logged. Only authorized administrators (`Super Admin` or `Org Admin`) can create/modify top-level entries and regenerate codes.
        </p>
      </div>
    </div>
  );
};

export default OrgList;