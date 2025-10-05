import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import api from "../services/api";
import { Link, useNavigate } from "react-router-dom";

const Home = () => {
  const { user, token, logout, setUser } = useAuth();
  const navigate = useNavigate();

  const [file, setFile] = useState(null);
  const [orgs, setOrgs] = useState([]);
  const [orgId, setOrgId] = useState("");
  const [expiry, setExpiry] = useState("");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) navigate("/login");
  }, [token, navigate]);

  useEffect(() => {
    const fetchUser = async () => {
      if (!token) return;
      try {
        const { data } = await api.get("/auth/me", { headers: { Authorization: `Bearer ${token}` } });
        setUser(data.user);
      } catch {
        setError("Failed fetching user, please login again.");
        logout();
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [token, setUser, logout]);

  useEffect(() => {
    if (!token) return;
    (async () => {
      try {
        const res = await api.get("/org/", { headers: { Authorization: `Bearer ${token}` } });
        setOrgs(res.data.organizations || []);
      } catch {
        setError("Failed to load organizations.");
      }
    })();
  }, [token]);

  useEffect(() => {
    if (!(user && token)) return;

    const orgToFetch = user.orgHierarchy?.slice(-1)[0]?._id || user.orgId;
    if (!orgToFetch) {
      setUsers([]);
      return;
    }

    (async () => {
      try {
        const res = await api.get(`/users/org/${orgToFetch}`, { headers: { Authorization: `Bearer ${token}` } });
        setUsers(res.data.users || []);
      } catch {
        setUsers([]);
      }
    })();
  }, [user, token]);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file || !orgId) return alert("Select file and organization.");

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("orgId", orgId);
      if (expiry) formData.append("expiryDate", expiry);

      await api.post("/files/upload", formData, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" },
      });

      alert("File uploaded and encrypted successfully!");
      setFile(null);
      setExpiry("");
      setOrgId("");
    } catch {
      alert("Upload failed. Try again.");
    }
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div>Loading...</div>
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="text-red-500 mb-3">{error}</div>
        <button onClick={() => window.location.reload()} className="btn btn-primary">
          Retry
        </button>
      </div>
    );

  return (
    <div className="min-h-screen flex flex-col items-center p-8 bg-gray-50">
      <div className="bg-white max-w-4xl w-full p-8 rounded-lg shadow">
        <div className="flex justify-between items-center mb-6">
           <Link
            to="/adminSettings"
            className="inline-block px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
           Settings
          </Link>
          <h1 className="text-2xl font-semibold">Welcome, {user?.name ?? "User"}</h1>
          <button
            onClick={logout}
            className="bg-red-500 hover:bg-red-600 text-white rounded px-4 py-1"
          >
            Logout
          </button>
        </div>

        <section className="mb-8">
          <h2 className="text-lg font-semibold mb-2">My Details</h2>
          <p>
            Name: <strong>{user?.name}</strong>
          </p>
          <p>
            Email: <strong>{user?.email}</strong>
          </p>
          <p>
            Role: <strong>{user?.role}</strong>
          </p>
          <p>
            Organization:{" "}
            <strong>{user?.orgHierarchy?.map((o) => o.name).join(" > ") || "—"}</strong>
          </p>
        </section>

        {(user?.role === "superAdmin" || user?.role === "orgAdmin") && (
          <section className="mb-8">
            <h2 className="text-lg font-semibold mb-4">Users In My Organization</h2>
            <div className="overflow-auto max-h-96">
              <table className="min-w-full bg-white border border-gray-300">
                <thead>
                  <tr>
                    <th className="border p-2 bg-gray-100">Name</th>
                    <th className="border p-2 bg-gray-100">Email</th>
                    <th className="border p-2 bg-gray-100">Role</th>
                    <th className="border p-2 bg-gray-100">Organization</th>
                  </tr>
                </thead>
                <tbody>
                  {users.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="border p-2 text-center">
                        No users found.
                      </td>
                    </tr>
                  ) : (
                    users.map((u) => (
                      <tr key={u._id} className="hover:bg-gray-50">
                        <td className="border p-2">{u.name}</td>
                        <td className="border p-2">{u.email}</td>
                        <td className="border p-2">{u.role}</td>
                        <td className="border p-2">{u.orgId?.name || "—"}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}

        <section>
          <h2 className="text-lg font-semibold mb-4">Upload a Secure File</h2>
          <form onSubmit={handleUpload} className="space-y-4">
            <select
              className="w-full p-2 border rounded"
              value={orgId}
              onChange={(e) => setOrgId(e.target.value)}
              required
            >
              <option value="">Select Organization</option>
              {orgs.map((org) => (
                <option key={org._id} value={org._id}>
                  {org.name} ({org.type})
                </option>
              ))}
            </select>

            <input
              type="file"
              onChange={(e) => setFile(e.target.files[0])}
              className="w-full p-2 border rounded"
              required
            />

            <input
              type="date"
              value={expiry}
              onChange={(e) => setExpiry(e.target.value)}
              className="w-full p-2 border rounded"
            />

            <button
              type="submit"
              className="bg-blue-600 text-white py-2 rounded hover:bg-blue-700 w-full"
            >
              Upload & Encrypt
            </button>
          </form>
        </section>

        <div className="mt-8 text-center">
          <Link
            to="/orglist"
            className="inline-block px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            View Organization List
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;
