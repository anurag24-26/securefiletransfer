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
        else setError(err.response?.data?.message || err.message || "Failed to fetch logs");
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, [token]);

  if (!user) return <p>Please login to view audit logs.</p>;
  if (error) return <p className="text-red-600">{error}</p>;
  if (loading) return <p>Loading audit logs...</p>;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Audit Logs</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border rounded-lg shadow-md">
          <thead className="bg-gray-100">
            <tr>
              <th className="py-2 px-4 border-b text-left">#</th>
              <th className="py-2 px-4 border-b text-left">User</th>
              <th className="py-2 px-4 border-b text-left">Email</th>
              <th className="py-2 px-4 border-b text-left">Role</th>
              <th className="py-2 px-4 border-b text-left">File</th>
              <th className="py-2 px-4 border-b text-left">Action</th>
              <th className="py-2 px-4 border-b text-left">Timestamp</th>
              <th className="py-2 px-4 border-b text-left">Details</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log, index) => (
              <tr
                key={log._id} // use MongoDB _id
                className={index % 2 === 0 ? "bg-gray-50" : "bg-white"}
              >
                <td className="py-2 px-4 border-b">{index + 1}</td>
                <td className="py-2 px-4 border-b">{log.user?._id ? log.user.name : "N/A"}</td>
                <td className="py-2 px-4 border-b">{log.user?._id ? log.user.email : "N/A"}</td>
                <td className="py-2 px-4 border-b">{log.user?._id ? log.user.role : "N/A"}</td>
                <td className="py-2 px-4 border-b">{log.file?._id ? log.file.originalName : "N/A"}</td>
                <td className="py-2 px-4 border-b font-semibold">{log.action}</td>
                <td className="py-2 px-4 border-b">
                  {log.timestamp ? new Date(log.timestamp).toLocaleString() : "N/A"}
                </td>
                <td className="py-2 px-4 border-b">{log.details || "N/A"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {logs.length === 0 && <p className="mt-4 text-gray-500">No logs found.</p>}
    </div>
  );
};

export default AuditLog;
