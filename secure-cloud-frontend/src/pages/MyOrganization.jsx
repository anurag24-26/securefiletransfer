import React, { useEffect, useState } from "react";
import api from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import { HiOutlineBuildingLibrary, HiOutlineUserGroup, HiOutlineIdentification, HiOutlineMail, HiOutlineXCircle, HiOutlineUserCircle } from "react-icons/hi2";

const MyOrganization = () => {
  const { token, setUser } = useAuth();
  const [org, setOrg] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);
  const [joinCode, setJoinCode] = useState("");
  const [message, setMessage] = useState("");

  // Fetch organization info
  const fetchOrg = async () => {
    setLoading(true);
    setErr(null);
    try {
      const res = await api.get("/users/my-org-info", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrg(res.data.organization || null);
    } catch (error) {
      const data = error.response?.data;
      if (data?.allowJoin) {
        setOrg(null); // means user can join
        setErr(null);
      } else {
        setErr(data?.message || "Could not fetch organization details.");
        setOrg(null);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchOrg();
  }, [token]);

  // Join organization by code
  const handleJoinOrg = async (e) => {
    e.preventDefault();
    setMessage("");
    setErr("");
    try {
      const res = await api.post(
        "/users/join-org",
        { joinCode },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage(res.data.message || "Joined successfully!");
      setJoinCode("");

      // Update user state after joining
      const { data: userData } = await api.get("/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (userData && userData.user && typeof setUser === "function") setUser(userData.user);

      await fetchOrg();
    } catch (error) {
      setErr(error.response?.data?.message || "Invalid join code or server error.");
    }
  };

  // Leave organization
  const handleLeaveOrg = async () => {
    if (!window.confirm("Are you sure you want to leave your organization?")) return;
    try {
      const res = await api.post("/users/leave-org", {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessage(res.data.message || "You have left your organization.");
      setOrg(null);
    } catch (error) {
      setErr(error.response?.data?.message || "Server error while leaving organization.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-blue-100 via-indigo-50 to-purple-100 py-12 px-4 transition-colors">
      <div className="bg-white rounded-3xl shadow-2xl px-8 py-10 max-w-xl w-full space-y-8 hover:shadow-indigo-200 transition-shadow duration-200">
        <h1 className="text-4xl font-black text-center mb-6 bg-gradient-to-r from-indigo-600 via-blue-500 to-indigo-700 text-transparent bg-clip-text tracking-tight">
          <HiOutlineBuildingLibrary className="inline-block mr-2 -mt-1" />
          My Organization
        </h1>

        {/* Loader */}
        {loading && (
          <div className="flex flex-col gap-2 items-center">
            <span className="inline-block h-8 w-8 rounded-full border-4 border-indigo-300 border-b-transparent animate-spin"></span>
            <span className="text-lg text-gray-500 animate-pulse">Loading organization ...</span>
          </div>
        )}

        {/* Error message */}
        {!loading && err && (
          <div className="flex items-center justify-center gap-2 text-red-600 bg-red-50 border border-red-200 p-2 rounded font-semibold">
            <HiOutlineXCircle className="text-xl" /> {err}
          </div>
        )}

        {/* Success message */}
        {message && (
          <div className="text-green-600 bg-green-50 rounded py-2 font-semibold text-center">{message}</div>
        )}

        {/* Org info card */}
        {!loading && org && (
          <div className="flex flex-col gap-4">
            {/* Leave button */}
            <div className="flex justify-end">
              <button
                className="flex items-center gap-1 bg-pink-100 hover:bg-pink-200 text-pink-700 rounded-full px-4 py-1 font-semibold text-sm transition"
                onClick={handleLeaveOrg}
                title="Leave organization"
              >
                <HiOutlineUserGroup className="text-lg" />
                Leave Organization
              </button>
            </div>
            <div className="rounded-xl border bg-gradient-to-r from-white to-indigo-50 p-6 flex flex-col gap-4 shadow">
              <div className="flex items-center gap-2 text-indigo-700 text-lg font-bold">
                <HiOutlineBuildingLibrary className="text-2xl" />
                {org.name}
              </div>
              <div className="flex items-center gap-2 text-gray-700 text-md">
                <HiOutlineIdentification className="text-lg" />
                <span className="capitalize">{org.type}</span>
              </div>
              {org.parent && (
                <div className="flex items-center gap-2 text-gray-700">
                  <span className="font-semibold">Parent:</span>
                  <span className="italic text-indigo-500">{typeof org.parent === "object" ? org.parent?.name : org.parent}</span>
                </div>
              )}
              {/* Admin section */}
              <div>
                <div className="flex items-center gap-2 mb-2 text-indigo-600 font-semibold">
                  <HiOutlineUserCircle className="text-lg" />
                  Admins
                </div>
                <div className="flex flex-col gap-2">
                  {org.admins && org.admins.length > 0 ? (
                    org.admins.map((admin) =>
                      admin ? (
                        <div
                          key={admin.id}
                          className="flex items-center justify-between bg-indigo-50 rounded px-3 py-1 shadow-inner"
                        >
                          <span className="font-bold text-indigo-700">{admin.name}</span>
                          <span className="text-xs text-gray-500">{admin.email}</span>
                          <span className="inline-block text-xs rounded-full px-2 py-0.5 bg-indigo-200 text-indigo-900 capitalize ml-2">
                            {admin.role.replace("Admin", " Admin")}
                          </span>
                        </div>
                      ) : null
                    )
                  ) : (
                    <span className="text-gray-400">No admins assigned</span>
                  )}
                </div>
              </div>
              {/* Details footer */}
              <div className="mt-4 flex items-center justify-center">
                <span className="inline-flex items-center bg-indigo-50 px-4 py-1 text-xs text-indigo-600 rounded-full shadow-sm">
                  <svg
                    className="h-4 w-4 mr-1 text-indigo-400"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <circle cx="12" cy="12" r="10" strokeDasharray="2 2" />
                  </svg>
                  Organization details are always up to date.
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Join organization form */}
        {!loading && !org && !err && (
          <form onSubmit={handleJoinOrg} className="bg-white rounded-lg shadow p-8 space-y-5 border border-indigo-100">
            <h3 className="text-2xl font-bold text-center text-indigo-700 mb-4">
              Join an Organization / Department
            </h3>
            <input
              type="text"
              placeholder="Enter Join Code"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value)}
              className="w-full p-3 rounded border border-indigo-300 text-gray-800 focus:ring-2 focus:ring-indigo-500 outline-none transition"
            />
            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-lg py-2 rounded-full transition"
            >
              Join
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default MyOrganization;
