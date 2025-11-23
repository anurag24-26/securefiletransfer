import React, { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import api from "../services/api";
import { motion } from "framer-motion";

const actionColors = {
  upload: "bg-green-100 text-green-700 border-green-200",
  delete: "bg-red-100 text-red-700 border-red-200",
  update: "bg-yellow-100 text-yellow-700 border-yellow-200",
  view: "bg-blue-100 text-blue-700 border-blue-200",
  default: "bg-gray-200 text-gray-700 border-gray-300",
};

const AuditLog = () => {
  const { user, token } = useAuth();
  const [logs, setLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [search, setSearch] = useState("");
  const [filterAction, setFilterAction] = useState("all");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch logs
  useEffect(() => {
    const fetchLogs = async () => {
      if (!token) return;
      setLoading(true);

      try {
        const { data } = await api.get("/files/audit-logs", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setLogs(data.logs);
        setFilteredLogs(data.logs);
      } catch (err) {
        setError(
          err.response?.data?.message ||
            err.message ||
            "Failed to fetch logs"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, [token]);

  // Apply filters
  useEffect(() => {
    let updated = [...logs];

    // Search
    if (search.trim() !== "") {
      updated = updated.filter((log) =>
        log.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
        log.file?.originalName?.toLowerCase().includes(search.toLowerCase()) ||
        log.action?.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Filter action
    if (filterAction !== "all") {
      updated = updated.filter(
        (log) => log.action?.toLowerCase() === filterAction
      );
    }

    setFilteredLogs(updated);
  }, [search, filterAction, logs]);

  if (!user) return <p className="p-6">Please login to view audit logs.</p>;
  if (error) return <p className="text-red-600 p-6">{error}</p>;

  if (loading)
    return (
      <div className="p-6 text-center text-gray-600 animate-pulse">
        Loading audit logs...
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 p-4 md:p-8">

      {/* Header */}
      <motion.h2
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl md:text-4xl font-extrabold mb-4 text-center text-gray-800"
      >
        📝 Audit Logs
      </motion.h2>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-4xl mx-auto mb-6 flex flex-col md:flex-row gap-3"
      >
        <input
          type="text"
          placeholder="Search by user, file, or action..."
          className="w-full px-4 py-3 bg-white/80 shadow rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-300"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          className="px-4 py-3 bg-white/80 shadow rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-300"
          value={filterAction}
          onChange={(e) => setFilterAction(e.target.value)}
        >
          <option value="all">All Actions</option>
          <option value="upload">Upload</option>
          <option value="delete">Delete</option>
          <option value="update">Update</option>
          <option value="view">View</option>
        </select>
      </motion.div>

      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto rounded-xl shadow-xl bg-white/70 backdrop-blur">
        <table className="min-w-full">
          <thead className="bg-gray-200/80 text-gray-700 sticky top-0 backdrop-blur">
            <tr>
              {["#", "User", "Email", "Role", "File", "Action", "Timestamp", "Details"].map(
                (header) => (
                  <th
                    key={header}
                    className="py-3 px-4 text-left font-semibold"
                  >
                    {header}
                  </th>
                )
              )}
            </tr>
          </thead>

          <tbody>
            {filteredLogs.map((log, index) => (
              <motion.tr
                key={log._id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="even:bg-gray-50 hover:bg-gray-100 transition"
              >
                <td className="py-3 px-4">{index + 1}</td>
                <td className="py-3 px-4">{log.user?.name || "N/A"}</td>
                <td className="py-3 px-4">{log.user?.email || "N/A"}</td>
                <td className="py-3 px-4">{log.user?.role || "N/A"}</td>
                <td className="py-3 px-4">{log.file?.originalName || "N/A"}</td>

                {/* Action with color badge */}
                <td className="py-3 px-4">
                  <span
                    className={`px-2 py-1 rounded-lg border text-xs font-semibold ${
                      actionColors[log.action?.toLowerCase()] ||
                      actionColors.default
                    }`}
                  >
                    {log.action}
                  </span>
                </td>

                <td className="py-3 px-4">
                  {log.timestamp
                    ? new Date(log.timestamp).toLocaleString()
                    : "N/A"}
                </td>

                <td className="py-3 px-4">{log.details || "N/A"}</td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-4 mt-2">
        {filteredLogs.map((log, index) => (
          <motion.div
            key={log._id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/80 shadow-lg border border-gray-200 p-4 rounded-2xl backdrop-blur"
          >
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs text-gray-500">#{index + 1}</span>

              <span
                className={`px-3 py-1 rounded-lg border text-xs font-semibold ${
                  actionColors[log.action?.toLowerCase()] ||
                  actionColors.default
                }`}
              >
                {log.action}
              </span>
            </div>

            <p className="text-lg font-bold text-gray-900">
              {log.user?.name || "Unknown User"}
            </p>
            <p className="text-sm text-gray-600">{log.user?.email}</p>

            <div className="text-sm text-gray-700 space-y-1 mt-2">
              <p>
                <span className="font-semibold">Role:</span>{" "}
                {log.user?.role || "N/A"}
              </p>
              <p>
                <span className="font-semibold">File:</span>{" "}
                {log.file?.originalName || "N/A"}
              </p>
              <p>
                <span className="font-semibold">Timestamp:</span>{" "}
                {log.timestamp
                  ? new Date(log.timestamp).toLocaleString()
                  : "N/A"}
              </p>
              <p>
                <span className="font-semibold">Details:</span>{" "}
                {log.details || "N/A"}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      {filteredLogs.length === 0 && (
        <p className="text-center text-gray-500 mt-6">No logs found.</p>
      )}
    </div>
  );
};

export default AuditLog;
