import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import api from "../services/api";
import Loader from "../components/Loader";

const VisibleFiles = () => {
  const { token } = useAuth();
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const res = await api.get("/files/visible-files", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setFiles(res.data.files);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchFiles();
  }, [token]);

  const handleDownload = (filename) => {
    const link = document.createElement("a");
    link.href = `${process.env.REACT_APP_API_URL}/uploads/${filename}`;
    link.download = filename;
    link.click();
  };

   if (loading) return <Loader />;
  if (!files.length) return <p className="text-white text-center mt-10">No files visible to you.</p>;

  return (
    <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {files.map(file => (
        <div key={file._id} className="bg-slate-800 text-gray-200 p-4 rounded shadow border border-slate-700">
          <h3 className="font-semibold mb-1">{file.originalName}</h3>
          <p><strong>Type:</strong> {file.type || "N/A"}</p>
          <p><strong>Uploaded By:</strong> {file.uploadedBy.name}</p>
          <p><strong>Visible Type:</strong> {file.visibleToType}</p>
          <button onClick={() => handleDownload(file.filename)} className="mt-2 w-full bg-blue-600 hover:bg-blue-700 py-1 rounded text-white">Download</button>
        </div>
      ))}
    </div>
  );
};

export default VisibleFiles;
