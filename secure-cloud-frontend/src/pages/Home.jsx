import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import api from "../services/api";
import { useNavigate } from "react-router-dom";
import Loader from "../components/Loader";
const Home = () => {
  const { user, token, logout, setUser } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [adminRequests, setAdminRequests] = useState([]);
  const [myRequests, setMyRequests] = useState([]);

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    const fetchUserAndRequests = async () => {
      try {
        const { data: userData } = await api.get("/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(userData.user);

        // Fetch admin-related requests if user is admin
        if (["superAdmin", "orgAdmin", "deptAdmin"].includes(userData.user.role)) {
          const { data: adminReqData } = await api.get("/requests", {
            headers: { Authorization: `Bearer ${token}` },
          });
          setAdminRequests(adminReqData.requests || []);
        } else {
          setAdminRequests([]);
        }

        // Always fetch requests targeted to this user themselves
        const { data: myReqData } = await api.get("/requests/my-requests", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMyRequests(myReqData.requests || []);
      } catch {
        setError("Session expired. Please login again.");
        logout();
      } finally {
        setLoading(false);
      }
    };

    fetchUserAndRequests();
  }, [token, setUser, logout, navigate]);

  const respondToRequest = async (id, action) => {
    try {
      const { data } = await api.post(
        `/requests/${id}/action`,
        { action },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert(data.message);

      setAdminRequests((prev) => prev.filter((r) => r._id !== id));
      setMyRequests((prev) => prev.filter((r) => r._id !== id));

      if (action === "approve" && data.user) {
        setUser(data.user);
      }
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to respond. Try again.");
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
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
        <p className="text-red-500 text-lg mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 p-6">
      <div className="max-w-4xl mx-auto bg-white p-8 rounded-3xl shadow-xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">
            Welcome, {user?.name ?? "User"} 👋
          </h1>
          <button
            onClick={() => {
              logout();
              navigate("/login");
            }}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-full"
          >
            Logout
          </button>
        </div>

        {/* User Details */}
        <section className="mb-10">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">My Details</h2>
          <div className="space-y-2 text-gray-600">
            <p><strong>Name:</strong> {user?.name}</p>
            <p><strong>Email:</strong> {user?.email}</p>
            <p><strong>Role:</strong> {user?.role}</p>
            <p>
              <strong>Organization:</strong>{" "}
              {user?.orgHierarchy?.map((o) => o.name).join(" > ") || "—"}
            </p>
          </div>
        </section>

        {/* Admin Requests */}
        {["superAdmin", "orgAdmin", "deptAdmin"].includes(user?.role) && adminRequests.length > 0 && (
          <section className="mb-10">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">
              Pending Admin Requests
            </h2>
            <div className="space-y-4">
              {adminRequests.map((r) => (
                <div key={r._id} className="p-4 bg-gray-50 border border-gray-200 rounded-xl shadow-sm flex justify-between items-center">
                  <div className="text-gray-700">
                    <p>
                      <strong>{r.sender?.name || "Unknown"}</strong> wants you to be admin for{" "}
                      <strong>{r.departmentId?.name || r.orgId?.name || "N/A"}</strong>
                    </p>
                  </div>
                  <div className="space-x-2">
                    <button
                      onClick={() => respondToRequest(r._id, "approve")}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-lg"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => respondToRequest(r._id, "reject")}
                      className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* User Targeted Requests */}
        {myRequests.length > 0 && (
          <section>
            <h2 className="text-xl font-semibold text-gray-700 mb-4">
              My Pending Requests
            </h2>
            <div className="space-y-4">
              {myRequests.map((r) => (
                <div
                  key={r._id}
                  className="p-4 bg-gray-50 border border-gray-200 rounded-xl shadow-sm flex justify-between items-center"
                >
                  <div className="text-gray-700 space-y-1">
                    <p>
                      <strong>{r.sender?.name || "Someone"}</strong> sent you a <span className="capitalize">{r.type}</span> request for{" "}
                      <strong>{r.orgId?.name || r.departmentId?.name || "Organization"}</strong>
                    </p>
                    {r.message && <p className="italic text-sm text-gray-500">{r.message}</p>}
                  </div>
                  <div className="space-x-2">
                    <button
                      onClick={() => respondToRequest(r._id, "approve")}
                      className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-lg"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => respondToRequest(r._id, "reject")}
                      className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-lg"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default Home;
