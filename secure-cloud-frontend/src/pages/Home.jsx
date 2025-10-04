// src/pages/Home.jsx
import React, { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

const Home = () => {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();

  const [userData, setUserData] = useState(user);
  const [orgs, setOrgs] = useState([]);
  const [selectedOrg, setSelectedOrg] = useState(null);
  const [loading, setLoading] = useState(!user);

  const [newOrg, setNewOrg] = useState({ name: "", type: "department", parentId: "" });
  const [editOrg, setEditOrg] = useState(null);
  const [error, setError] = useState("");

  // Fetch user and organizations
  useEffect(() => {
    if (!token) return navigate("/login");

    const fetchData = async () => {
      try {
        if (!userData) {
          const resUser = await api.get("/auth/me", {
            headers: { Authorization: `Bearer ${token}` },
          });
          setUserData(resUser.data.user);
        }

        const resOrgs = await api.get("/org", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setOrgs(resOrgs.data);
      } catch (err) {
        console.error(err);
        logout();
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  const fetchHierarchy = async (orgId) => {
    try {
      const res = await api.get(`/org/hierarchy/${orgId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSelectedOrg(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  // Create new organization
  const handleCreateOrg = async () => {
    setError("");
    try {
      const res = await api.post("/org/create", newOrg, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrgs([...orgs, res.data.org]);
      setNewOrg({ name: "", type: "department", parentId: "" });
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Error creating organization");
    }
  };

  // Update organization
  const handleEditOrg = async () => {
    if (!editOrg) return;
    setError("");
    try {
      const res = await api.put(`/org/${editOrg._id}`, editOrg, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrgs(orgs.map((o) => (o._id === res.data.org._id ? res.data.org : o)));
      setEditOrg(null);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Error editing organization");
    }
  };

  // Delete organization
  const handleDeleteOrg = async (id) => {
    if (!window.confirm("Are you sure you want to delete this organization?")) return;
    try {
      await api.delete(`/org/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      setOrgs(orgs.filter((o) => o._id !== id));
      if (selectedOrg?._id === id) setSelectedOrg(null);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Error deleting organization");
    }
  };

  const renderHierarchy = (org) => {
    if (!org) return null;
    return (
      <ul className="ml-4 border-l-2 border-gray-300 pl-4">
        <li className="mb-2">
          <span className="font-semibold text-gray-700">{org.type}:</span> {org.name}
          {org.children && org.children.length > 0 && (
            <div className="mt-1">
              {org.children.map((child) => (
                <div key={child._id}>{renderHierarchy(child)}</div>
              ))}
            </div>
          )}
        </li>
      </ul>
    );
  };

  if (loading) return <p className="text-center mt-20 text-gray-500">Loading...</p>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 p-6">
      <div className="max-w-7xl mx-auto bg-white p-8 rounded-3xl shadow-2xl">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Welcome, {userData?.name} 👋</h1>
            <p className="text-sm text-gray-500 mt-1">
              Logged in as <span className="font-medium">{userData?.role}</span>
            </p>
          </div>
          <button
            onClick={() => {
              logout();
              navigate("/login");
            }}
            className="mt-4 md:mt-0 bg-red-500 hover:bg-red-600 text-white py-2 px-6 rounded-full transition duration-300"
          >
            Logout
          </button>
        </div>

        {/* User Info & Hierarchy */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          <div className="bg-gray-50 p-6 rounded-xl shadow hover:shadow-lg transition duration-300">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">User Details</h3>
            <p>
              <strong>Email:</strong> {userData?.email}
            </p>
            <p>
              <strong>Role:</strong> {userData?.role}
            </p>
          </div>
          {selectedOrg && (
            <div className="bg-gray-50 p-6 rounded-xl shadow hover:shadow-lg transition duration-300">
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                Hierarchy of {selectedOrg.name}
              </h3>
              {renderHierarchy(selectedOrg)}
            </div>
          )}
        </div>

        {/* Organizations List */}
        <h2 className="text-xl font-bold text-gray-800 mb-4">Organizations</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
          {orgs.map((org) => (
            <div
              key={org._id}
              className="p-4 bg-white border border-gray-200 rounded-xl shadow hover:shadow-lg hover:border-blue-400 transition cursor-pointer"
            >
              <p className="text-sm text-gray-500 mb-1">{org.type.toUpperCase()}</p>
              <h4
                className="text-lg font-semibold text-gray-700 mb-2 hover:underline"
                onClick={() => fetchHierarchy(org._id)}
              >
                {org.name}
              </h4>
              {userData?.role === "admin" && (
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => setEditOrg(org)}
                    className="bg-yellow-400 hover:bg-yellow-500 text-white py-1 px-3 rounded-lg text-sm transition"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteOrg(org._id)}
                    className="bg-red-500 hover:bg-red-600 text-white py-1 px-3 rounded-lg text-sm transition"
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Admin Panel - Create / Edit */}
        {userData?.role === "admin" && (
          <div className="bg-gray-50 p-6 rounded-xl shadow hover:shadow-lg transition duration-300 mb-10">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              {editOrg ? "Edit Organization" : "Create New Organization"}
            </h3>
            {error && <p className="text-red-500 mb-3">{error}</p>}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
              <input
                type="text"
                placeholder="Organization Name"
                value={editOrg ? editOrg.name : newOrg.name}
                onChange={(e) =>
                  editOrg
                    ? setEditOrg({ ...editOrg, name: e.target.value })
                    : setNewOrg({ ...newOrg, name: e.target.value })
                }
                className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 w-full"
              />
              <select
                value={editOrg ? editOrg.type : newOrg.type}
                onChange={(e) =>
                  editOrg
                    ? setEditOrg({ ...editOrg, type: e.target.value })
                    : setNewOrg({ ...newOrg, type: e.target.value })
                }
                className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 w-full"
              >
                <option value="university">University</option>
                <option value="department">Department</option>
                <option value="hospital">Hospital</option>
                <option value="clinic">Clinic</option>
              </select>
              <select
                value={editOrg ? editOrg.parentId || "" : newOrg.parentId}
                onChange={(e) =>
                  editOrg
                    ? setEditOrg({ ...editOrg, parentId: e.target.value })
                    : setNewOrg({ ...newOrg, parentId: e.target.value })
                }
                className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 w-full"
              >
                <option value="">Select Parent (optional)</option>
                {orgs.map((org) => (
                  <option key={org._id} value={org._id}>
                    {org.name}
                  </option>
                ))}
              </select>
              <button
                onClick={editOrg ? handleEditOrg : handleCreateOrg}
                className={`${
                  editOrg ? "bg-yellow-400 hover:bg-yellow-500" : "bg-blue-500 hover:bg-blue-600"
                } text-white py-3 px-6 rounded-lg transition duration-300 w-full`}
              >
                {editOrg ? "Update" : "Create"}
              </button>
            </div>
            {editOrg && (
              <button
                onClick={() => setEditOrg(null)}
                className="mt-4 bg-gray-300 hover:bg-gray-400 py-2 px-4 rounded-lg text-sm"
              >
                Cancel
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
