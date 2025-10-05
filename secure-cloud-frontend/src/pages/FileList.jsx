import React, { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import api from "../services/api";

const FileList = () => {
  const { token, user } = useAuth();
  const [files, setFiles] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;

    const fetchFiles = async () => {
      try {
        const res = await api.get("/files/", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setFiles(res.data.files || []);
      } catch {
        setError("Failed to load files.");
      }
      setLoading(false);
    };
    fetchFiles();
  }, [token]);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this file?")) return;
    try {
      await api.delete(`/files/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFiles(files.filter((file) => file._id !== id));
    } catch {
      alert("Failed to delete file.");
    }
  };

  if (loading)
    return <div className="p-4 text-center">Loading files...</div>;

  if (error)
    return (
      <div className="p-4 text-center text-red-600">
        {error}
      </div>
    );

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Uploaded Files</h2>
      {files.length === 0 ? (
        <p>No files uploaded yet.</p>
      ) : (
        <table className="w-full border-collapse border">
          <thead className="bg-gray-200">
            <tr>
              <th className="border p-2 text-left">Filename</th>
              <th className="border p-2 text-left">Original Name</th>
              <th className="border p-2 text-left">Organization</th>
              <th className="border p-2 text-left">Uploaded By</th>
              <th className="border p-2 text-left">Encrypted</th>
              <th className="border p-2 text-left">Expiry Date</th>
              <th className="border p-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {files.map((file) => (
              <tr key={file._id} className="hover:bg-gray-100">
                <td className="border p-2">{file.filename}</td>
                <td className="border p-2">{file.originalName}</td>
                <td className="border p-2">{file.orgId?.name || "-"}</td>
                <td className="border p-2">{file.uploadedBy?.name || "-"}</td>
                <td className="border p-2">{file.encrypted ? "Yes" : "No"}</td>
                <td className="border p-2">{file.expiryDate ? new Date(file.expiryDate).toLocaleDateString() : "-"}</td>
                <td className="border p-2">
                  {(user.role === "superAdmin" || file.uploadedBy?._id === user.id) && (
                    <button
                      onClick={() => handleDelete(file._id)}
                      className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                    >
                      Delete
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default FileList;
