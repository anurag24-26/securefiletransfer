import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import api from "../services/api";

const FilesUpload = () => {
  const { token } = useAuth();
  const [file, setFile] = useState(null);
  const [description, setDescription] = useState("");
  const [type, setType] = useState("");
  const [visibleTo, setVisibleTo] = useState("");
  const [visibleToType, setVisibleToType] = useState("Department");
  const [departments, setDepartments] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [users, setUsers] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) return;
    const fetchTargets = async () => {
      try {
        const res = await api.get("/files/visibility-targets", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setDepartments(res.data.departments || []);
        setOrganizations(res.data.organizations || []);
        setUsers(res.data.users || []);
      } catch (err) {
        console.error(err);
        setMessage("Failed to load visibility targets");
      }
    };
    fetchTargets();
  }, [token]);

  const handleFileChange = (e) => setFile(e.target.files[0]);

  const getVisibleOptions = () => {
    switch (visibleToType) {
      case "Department":
        return departments;
      case "Organization":
        return organizations;
      case "User":
        return users;
      default:
        return [];
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file || !type || !visibleTo) {
      setMessage("Please fill in all required fields.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("description", description);
    formData.append("type", type);
    formData.append("visibleTo", visibleTo);
    formData.append("visibleToType", visibleToType);

    setLoading(true);
    setMessage("");

    try {
      const res = await api.post("/files/upload", formData, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" },
      });
      setMessage(res.data.message || "File uploaded successfully!");
      setFile(null);
      setDescription("");
      setType("");
      setVisibleTo("");
      setVisibleToType("Department");
    } catch (err) {
      console.error(err);
      setMessage(err.response?.data?.message || "Error uploading file.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 p-4">
      <div className="bg-slate-800 p-8 rounded-xl w-full max-w-md shadow-lg border border-slate-700">
        <h2 className="text-white text-2xl font-bold mb-6 text-center">Upload Encrypted File</h2>
        <form onSubmit={handleUpload} className="space-y-4">
          <div>
            <label className="text-gray-300 block mb-1">Select File *</label>
            <input type="file" onChange={handleFileChange} className="w-full p-2 rounded border border-slate-600 bg-slate-700 text-gray-200"/>
          </div>
          <div>
            <label className="text-gray-300 block mb-1">Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Optional note" className="w-full p-2 rounded border border-slate-600 bg-slate-700 text-gray-200" rows={2} />
          </div>
          <div>
            <label className="text-gray-300 block mb-1">File Type *</label>
            <select value={type} onChange={(e) => setType(e.target.value)} className="w-full p-2 rounded border border-slate-600 bg-slate-700 text-gray-200">
              <option value="">Select type</option>
              <option value="report">Report</option>
              <option value="document">Document</option>
              <option value="presentation">Presentation</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label className="text-gray-300 block mb-1">Visible Type *</label>
            <select value={visibleToType} onChange={(e) => { setVisibleToType(e.target.value); setVisibleTo(""); }} className="w-full p-2 rounded border border-slate-600 bg-slate-700 text-gray-200">
              <option value="Department">Department</option>
              <option value="Organization">Organization</option>
              <option value="User">User</option>
            </select>
          </div>
          <div>
            <label className="text-gray-300 block mb-1">Visible To *</label>
            <select value={visibleTo} onChange={(e) => setVisibleTo(e.target.value)} className="w-full p-2 rounded border border-slate-600 bg-slate-700 text-gray-200">
              <option value="">Select {visibleToType}</option>
              {getVisibleOptions().map(item => <option key={item._id} value={item._id}>{item.name}</option>)}
            </select>
          </div>
          <button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded font-semibold">
            {loading ? "Uploading..." : "Upload File"}
          </button>
          {message && <p className={`text-center mt-2 ${message.toLowerCase().includes("success") ? "text-green-400" : "text-red-400"}`}>{message}</p>}
        </form>
      </div>
    </div>
  );
};

export default FilesUpload;
