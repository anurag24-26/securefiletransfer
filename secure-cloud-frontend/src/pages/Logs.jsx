import React, { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import api from "../services/api";

const AuditLog = () => {
  const { user, token } = useAuth();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLogs = async () => {
      if (!token) return;
      setLoading(true);
      try {
        const { data } = await api.get("/files/audit-logs", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setLogs(data.logs);
      } catch (err) {
        if (err.response?.status === 403) setError("Access denied");
        else
          setError(
            err.response?.data?.message || err.message || "Failed to fetch logs"
          );
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, [token]);

  if (!user) return <p>Please login to view audit logs.</p>;
  if (error) return <p className="text-red-600 p-6">{error}</p>;
  if (loading) return <p className="p-6">Loading audit logs...</p>;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h2 className="text-3xl font-bold mb-6 text-gray-800">
        📝 Audit Logs
      </h2>

      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto shadow-lg rounded-lg">
        <table className="min-w-full bg-white">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="py-3 px-4 border-b text-left">#</th>
              <th className="py-3 px-4 border-b text-left">User</th>
              <th className="py-3 px-4 border-b text-left">Email</th>
              <th className="py-3 px-4 border-b text-left">Role</th>
              <th className="py-3 px-4 border-b text-left">File</th>
              <th className="py-3 px-4 border-b text-left">Action</th>
              <th className="py-3 px-4 border-b text-left">Timestamp</th>
              <th className="py-3 px-4 border-b text-left">Details</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log, index) => (
              <tr
                key={log._id}
                className="even:bg-gray-50 hover:bg-gray-100 transition"
              >
                <td className="py-3 px-4 border-b">{index + 1}</td>
                <td className="py-3 px-4 border-b">
                  {log.user?._id ? log.user.name : "N/A"}
                </td>
                <td className="py-3 px-4 border-b">
                  {log.user?._id ? log.user.email : "N/A"}
                </td>
                <td className="py-3 px-4 border-b">
                  {log.user?.role || "N/A"}
                </td>
                <td className="py-3 px-4 border-b">
                  {log.file?._id ? log.file.originalName : "N/A"}
                </td>

                <td className="py-3 px-4 border-b font-semibold text-blue-600">
                  {log.action}
                </td>

                <td className="py-3 px-4 border-b">
                  {log.timestamp
                    ? new Date(log.timestamp).toLocaleString()
                    : "N/A"}
                </td>

                <td className="py-3 px-4 border-b">
                  {log.details || "N/A"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-4">
        {logs.map((log, index) => (
          <div
            key={log._id}
            className="border rounded-lg p-4 bg-white shadow-sm"
          >
            <div className="flex justify-between mb-2">
              <span className="text-sm text-gray-500">#{index + 1}</span>
              <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                {log.action}
              </span>
            </div>

            <p className="text-lg font-semibold text-gray-800">
              {log.user?.name || "Unknown User"}
            </p>
            <p className="text-sm text-gray-600 mb-2">
              {log.user?.email || "No email"}
            </p>

            <p className="text-sm">
              <span className="font-semibold">Role:</span> {log.user?.role || "N/A"}
            </p>

            <p className="text-sm">
              <span className="font-semibold">File:</span>{" "}
              {log.file?.originalName || "N/A"}
            </p>

            <p className="text-sm">
              <span className="font-semibold">Timestamp:</span>{" "}
              {log.timestamp
                ? new Date(log.timestamp).toLocaleString()
                : "N/A"}
            </p>

            <p className="text-sm mt-1">
              <span className="font-semibold">Details:</span>{" "}
              {log.details || "N/A"}
            </p>
          </div>
        ))}
      </div>

      {logs.length === 0 && (
        <p className="mt-4 text-gray-500 text-center">No logs found.</p>
      )}
    </div>
  );
};

export default AuditLog;
