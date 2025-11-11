import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../contexts/AuthContext";
import api from "../services/api";
import Loader from "../components/Loader";
import bgImage from "../assets/Back2.jpg";

const FilesDashboard = () => {
  const { token,user } = useAuth();
  const [activeTab, setActiveTab] = useState("upload");
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
const [downloadingFileId, setDownloadingFileId] = useState(null);

  const [file, setFile] = useState(null);
  const [description, setDescription] = useState("");
  const [type, setType] = useState("");
  const [visibleTo, setVisibleTo] = useState("");
  const [visibleToType, setVisibleToType] = useState("Department");
  const [departments, setDepartments] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [users, setUsers] = useState([]);
  const [message, setMessage] = useState("");
const [fileToDelete, setFileToDelete] = useState(null);
  const [selectedFileUrl, setSelectedFileUrl] = useState(null); // For in-site view
  const [selectedFileName, setSelectedFileName] = useState("");

  // Fetch visibility targets
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

  // Fetch visible files
  useEffect(() => {
    if (activeTab !== "visible" || !token) return;
    const fetchFiles = async () => {
      setLoading(true);
      try {
        const res = await api.get("/files/visible-files", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setFiles(res.data.files || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchFiles();
  }, [activeTab, token]);

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
const handleDelete = async (file) => {
  console.log("Deleting file:", file);
  if (!file) return;
  const fileId = file._id || file.id;
  console.log("File ID:", fileId);
  if (!fileId) return;
  
  try {
    setLoading(true);
    await api.delete(`/files/delete/${fileId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setMessage("File deleted successfully!");
    setFiles((prev) => prev.filter((f) => f._id !== fileId && f.id !== fileId));
  } catch (err) {
    console.error(err);
    setMessage(err.response?.data?.message || "Error deleting file.");
  } finally {
    setLoading(false);
  }
};


  const handleView = async (fileId) => {
  try {
    const res = await api.get(`/files/download/${fileId}`, {
      responseType: "blob",
      headers: { Authorization: `Bearer ${token}` },
    });
    const url = window.URL.createObjectURL(new Blob([res.data]));
    setSelectedFileUrl(url);
    const fileObj = files.find(f => f.id === fileId || f._id === fileId);
    setSelectedFileName(fileObj?.originalName || "file");
    window.scrollTo({ top: 0, behavior: "smooth" });
  } catch (err) {
    setMessage("Unable to preview this file.");
  }
};
const handleDownload = async (fileId, fileName) => {
  try {
    setDownloadingFileId(fileId); // mark downloading

    const response = await api.get(`/files/download/${fileId}`, {
      responseType: "blob",
      headers: { Authorization: `Bearer ${token}` },
    });

    const blob = new Blob([response.data]);
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", fileName || "file");
    document.body.appendChild(link);
    link.click();
    link.remove();

  } catch (error) {
    console.error("Download failed:", error.response?.data || error.message);
    alert(error.response?.data?.message || "Download failed");
  } finally {
    setDownloadingFileId(null); // reset after complete or error
  }
};


  return (
    <div
      className="min-h-screen flex flex-col items-center justify-start bg-cover bg-center relative px-4 py-10"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-md"></div>

      <div className="relative z-10 w-full max-w-7xl">
        {/* Tabs */}
        <div className="flex justify-center mb-10 space-x-4">
          {["upload", "visible"].map((tab) => (
            <motion.button
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                setSelectedFileUrl(null);
              }}
              whileHover={{ scale: 1.05 }}
              className={`px-6 py-2.5 rounded-full font-semibold transition-all ${
                activeTab === tab
                  ? "bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-lg"
                  : "bg-white/10 text-purple-200 border border-white/30 hover:bg-white/20"
              }`}
            >
              {tab === "upload" ? "Upload File" : "Visible Files"}
            </motion.button>
          ))}
        </div>

        {/* File Viewer */}
        {selectedFileUrl && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-10 bg-white/20 backdrop-blur-2xl border border-white/30 rounded-3xl shadow-2xl p-6"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-white">
                Viewing: {selectedFileName}
              </h3>
              <button
                onClick={() => setSelectedFileUrl(null)}
                className="text-red-400 hover:text-red-500 font-semibold"
              >
                ✕ Close
              </button>
            </div>
            <iframe
              src={selectedFileUrl}
              title="File Viewer"
              className="w-full h-[600px] rounded-xl border border-white/30 bg-white"
            ></iframe>
          </motion.div>
        )}

        {/* Upload / Visible Tabs */}
        <AnimatePresence mode="wait">
          {activeTab === "upload" ? (
            <motion.div
              key="upload"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="mx-auto bg-white/15 backdrop-blur-2xl border border-white/30 rounded-3xl shadow-2xl p-8 w-full max-w-md"
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
          ) : (
            <motion.div
              key="visible"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="mx-auto max-w-7xl"
            >
              {loading ? (
                <Loader />
              ) : files.length === 0 ? (
                <p className="text-center text-white text-lg font-medium bg-white/20 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/30 shadow-xl">
                  No files visible to you.
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                  {files.map((file, index) => (
                    <motion.div
                      key={file.id}
                      initial={{ opacity: 0, scale: 0.9, y: 20 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      transition={{
                        duration: 0.4,
                        delay: index * 0.05,
                        type: "spring",
                        stiffness: 100,
                      }}
                      className="relative bg-white/15 backdrop-blur-lg rounded-3xl p-6 border border-white/30 shadow-2xl hover:shadow-purple-700/40 transition duration-300"
                    >
                      <h3 className="text-xl font-semibold text-white mb-3 truncate">
                        {file.description || "No description available."}
                      </h3>

                      <div className="text-gray-200 text-sm space-y-1">
                        <p>
                          <span className="font-semibold text-purple-300">
                            Uploaded By:
                          </span>{" "}
                          {file.uploadedBy?.name || "Unknown"}{" "}
                          <span className="text-gray-400 text-xs">
                            ({file.uploadedBy?.role || "N/A"})
                          </span>
                        </p>
                        <p>
                          <span className="font-semibold text-purple-300">
                            Organization:
                          </span>{" "}
                          {file.organization?.name || "N/A"}{" "}
                          <span className="text-gray-400 text-xs">
                            ({file.organization?.type || "N/A"})
                          </span>
                        </p>
                        <p>
                          <span className="font-semibold text-purple-300">
                            Uploaded On:
                          </span>{" "}
                          {new Date(file.uploadedAt).toLocaleString()}
                        </p>
                      </div>

                      <div className="flex gap-2 mt-5">
                       {/*<motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                         onClick={() => handleView(file.id || file._id)}
                          className="flex-1 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold shadow-lg hover:from-blue-600 hover:to-indigo-700 transition"
                        >
                          View
                        </motion.button> */}

                       <motion.button
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
  onClick={() => handleDownload(file.id || file._id, file.originalName)}
  disabled={downloadingFileId === (file.id || file._id)}
  className={`flex-1 py-2 rounded-xl font-semibold shadow-lg transition ${
    downloadingFileId === (file.id || file._id)
      ? "bg-gray-400 cursor-not-allowed"
      : "bg-gradient-to-r from-purple-500 to-pink-600 text-white hover:from-purple-600 hover:to-pink-700"
  }`}
>
  {downloadingFileId === (file.id || file._id) ? "Downloading..." : "Download"}
</motion.button>

                      {((file.uploadedBy?._id === user?.id || file.uploadedBy?.id === user?.id) || user?.role === "superAdmin") && (
  <motion.button
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
  onClick={() => handleDelete(file)}
  className="flex-1 py-2 rounded-xl bg-red-600 text-white font-semibold shadow-lg hover:bg-red-700 transition"
>
  Delete
</motion.button>

)}

                      </div>
                    </motion.div>
                    
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default FilesDashboard;
