import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuth } from "../contexts/AuthContext";
import api from "../services/api";
import bgImage from "../assets/back1.jpg";

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
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
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
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center relative px-4 py-10"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-md"></div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 bg-white/15 backdrop-blur-2xl border border-white/30 rounded-3xl shadow-2xl p-8 w-full max-w-md"
      >
        <h2 className="text-3xl font-bold text-center text-white mb-8 drop-shadow-lg">
          Upload Encrypted File
        </h2>

        <form onSubmit={handleUpload} className="space-y-5">
          <div>
            <label className="text-purple-200 block mb-1 font-medium">
              Select File *
            </label>
            <input
              type="file"
              onChange={handleFileChange}
              className="w-full px-3 py-2 rounded-xl bg-white/10 text-white border border-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="text-purple-200 block mb-1 font-medium">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional note"
              className="w-full px-3 py-2 rounded-xl bg-white/10 text-white border border-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500"
              rows={2}
            />
          </div>

          <div>
            <label className="text-purple-200 block mb-1 font-medium">
              File Type *
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-white/10 text-white border border-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">Select type</option>
              <option value="report">Report</option>
              <option value="document">Document</option>
              <option value="presentation">Presentation</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="text-purple-200 block mb-1 font-medium">
              Visible Type *
            </label>
            <select
              value={visibleToType}
              onChange={(e) => {
                setVisibleToType(e.target.value);
                setVisibleTo("");
              }}
              className="w-full px-3 py-2 rounded-xl bg-white/10 text-white border border-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="Department">Department</option>
              <option value="Organization">Organization</option>
              <option value="User">User</option>
            </select>
          </div>

          <div>
            <label className="text-purple-200 block mb-1 font-medium">
              Visible To *
            </label>
            <select
              value={visibleTo}
              onChange={(e) => setVisibleTo(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-white/10 text-white border border-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">Select {visibleToType}</option>
              {getVisibleOptions().map((item) => (
                <option key={item._id} value={item._id}>
                  {item.name}
                </option>
              ))}
            </select>
          </div>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white py-2.5 rounded-xl font-semibold shadow-lg"
          >
            {loading ? "Uploading..." : "Upload File"}
          </motion.button>

          {message && (
            <p
              className={`text-center mt-2 ${
                message.toLowerCase().includes("success")
                  ? "text-green-400"
                  : "text-red-400"
              }`}
            >
              {message}
            </p>
          )}
        </form>
      </motion.div>
    </div>
  );
};

export default FilesUpload;
