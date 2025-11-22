// FilesDashboard.jsx
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../contexts/AuthContext";
import api from "../services/api";
import Loader from "../components/Loader";

import { FiUpload, FiTrash2, FiDownload } from "react-icons/fi";
import { HiOutlineDocumentSearch } from "react-icons/hi";

import "./FilesDashboard.css"; // <- new premium CSS

import bgImage from "../assets/back1.jpg";

const FileTypePill = ({ type }) => {
  const map = {
    report: { label: "Report", emoji: "📊" },
    document: { label: "Document", emoji: "📄" },
    presentation: { label: "Presentation", emoji: "🎤" },
    other: { label: "Other", emoji: "📦" },
  };
  const info = map[type] || map.other;
  return (
    <span className="pill-glass inline-flex items-center gap-2 text-xs font-semibold">
      <span>{info.emoji}</span>
      <span>{info.label}</span>
    </span>
  );
};

const EmptyState = () => (
  <div className="empty-state flex flex-col items-center justify-center py-12 px-6 text-center">
    <svg width="160" height="120" viewBox="0 0 160 120" fill="none" className="mb-4">
      <rect x="6" y="18" width="148" height="84" rx="10" fill="#ffffff20" />
      <rect x="22" y="34" width="60" height="12" rx="4" fill="#ffffff18" />
      <rect x="22" y="52" width="110" height="10" rx="4" fill="#ffffff18" />
      <rect x="22" y="68" width="80" height="10" rx="4" fill="#ffffff18" />
      <circle cx="124" cy="40" r="14" fill="#ffffff18" />
    </svg>
    <h3 className="text-lg font-semibold text-white">📁 No files yet</h3>
    <p className="text-sm text-white/80 max-w-xs mt-2">
      Upload your first secure file to get started. Files will appear here for your team.
    </p>
  </div>
);

const FilesDashboard = () => {
  const { token, user } = useAuth();

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
        setMessage("⚠️ Failed to load visibility targets");
      }
    };
    fetchTargets();
  }, [token]);

  useEffect(() => {
    if (activeTab !== "visible" || !token) return;
    (async () => {
      setLoading(true);
      try {
        const res = await api.get("/files/visible-files", { headers: { Authorization: `Bearer ${token}` } });
        setFiles(res.data.files || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, [activeTab, token]);

  const getVisibleOptions = () => {
    if (visibleToType === "Department") return departments;
    if (visibleToType === "Organization") return organizations;
    if (visibleToType === "User") return users;
    return [];
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file || !type || !visibleTo) {
      setMessage("⚠️ Please fill required fields.");
      return;
    }
    setLoading(true);
    setMessage("");
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("description", description);
      fd.append("type", type);
      fd.append("visibleTo", visibleTo);
      fd.append("visibleToType", visibleToType);

      await api.post("/files/upload", fd, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" },
      });

      setMessage("🎉 File uploaded successfully!");
      setFile(null);
      setDescription("");
      setType("");
      setVisibleTo("");

      if (activeTab === "visible") {
        const r = await api.get("/files/visible-files", { headers: { Authorization: `Bearer ${token}` } });
        setFiles(r.data.files || []);
      }
    } catch (err) {
      console.error(err);
      setMessage("❌ Upload failed");
    } finally {
      setLoading(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleDownload = async (fileId, fileName) => {
    try {
      setDownloadingFileId(fileId);
      const res = await api.get(`/files/download/${fileId}`, {
        responseType: "blob",
        headers: { Authorization: `Bearer ${token}` },
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", fileName || "file");
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error(err);
      alert("❌ Download failed");
    } finally {
      setDownloadingFileId(null);
    }
  };

  const handleDelete = async (fileObj) => {
    const fileId = fileObj._id || fileObj.id;
    if (!fileId) return;
    if (!confirm("Are you sure you want to delete this file?")) return;

    try {
      setLoading(true);
      await api.delete(`/files/delete/${fileId}`, { headers: { Authorization: `Bearer ${token}` } });
      setFiles((prev) => prev.filter((f) => f._id !== fileId && f.id !== fileId));
      setMessage("🗑️ File deleted!");
    } catch (err) {
      console.error(err);
      setMessage("⚠️ Delete failed");
    } finally {
      setLoading(false);
    }
  };

  const fmtDate = (d) => {
    try {
      return new Date(d).toLocaleString();
    } catch {
      return d;
    }
  };

  const container = { hidden: { opacity: 0, y: 8 }, visible: { opacity: 1, y: 0, transition: { staggerChildren: 0.03 } } };
  const card = { hidden: { opacity: 0, y: 10, scale: 0.98 }, visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.3 } } };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen relative"
      style={{ backgroundImage: `url(${bgImage})`, backgroundSize: "cover", backgroundPosition: "center" }}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm pointer-events-none" />

      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-28 -top-24 w-96 h-96 rounded-full bg-gradient-to-tr from-[#3b82f6]/30 to-[#06b6d4]/18 blur-3xl blob-float" />
        <div className="absolute right-4 top-10 w-72 h-72 rounded-full bg-gradient-to-tr from-[#06b6d4]/18 to-[#3b82f6]/12 blur-2xl blob-float" />
      </div>

      <div className="relative max-w-6xl mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-semibold text-white">Secure Files</h1>
            <p className="text-sm text-white/75 mt-1">Manage encrypted files and share with your team.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-sm text-white/80">Signed in as</div>
            <div className="px-3 py-1 bg-white/8 border border-white/10 rounded text-white/90 text-sm">
              {user?.name || user?.email || "You"}
            </div>
          </div>
        </div>

        <div className="mb-6">
          <div className="inline-flex items-center gap-2 rounded-2xl p-1">
            <div className="relative z-10 flex gap-2 bg-white/4 backdrop-blur px-2 py-1 rounded-2xl">
              {[
                { key: "upload", label: "Upload File", icon: <FiUpload /> },
                { key: "visible", label: "Visible Files", icon: <HiOutlineDocumentSearch /> },
              ].map((t) => {
                const active = activeTab === t.key;
                return (
                  <motion.button
                    key={t.key}
                    onClick={() => setActiveTab(t.key)}
                    whileHover={{ scale: 1.02 }}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
                      active
                        ? "bg-gradient-to-r from-[#3b82f6] to-[#06b6d4] text-black shadow-md"
                        : "text-white/80 hover:bg-white/6"
                    }`}
                  >
                    <span className="text-base">{t.icon}</span>
                    <span>{t.label}</span>
                  </motion.button>
                );
              })}
            </div>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {activeTab === "upload" ? (
            <motion.section key="upload" initial="hidden" animate="visible" exit="hidden" variants={container} className="mb-12">
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mb-4">
                <h2 className="text-xl font-semibold text-white inline-block">🔐 Upload Secure File</h2>
                <motion.div initial={{ width: 0 }} animate={{ width: "9rem", transition: { duration: 0.45, ease: "easeOut" } }} className="h-1 rounded-full bg-gradient-to-r from-[#3b82f6] to-[#06b6d4] mt-2" />
              </motion.div>

              <motion.form onSubmit={handleUpload} className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
                <div className="lg:col-span-2 grid gap-4">
                  <div>
                    <label className="block text-sm text-white/85 mb-1">Description</label>
                    <input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Short note (optional)" className="w-full rounded-md border border-white/12 bg-white/4 px-3 py-2 text-white placeholder-white/60" />
                  </div>

                  <div className="flex gap-3">
                    <div className="flex-1">
                      <label className="block text-sm text-white/85 mb-1">Type *</label>
                      <select value={type} onChange={(e) => setType(e.target.value)} className="w-full rounded-md border border-white/12 bg-white text-black px-3 py-2">
                        <option value="">Select type</option>
                        <option value="report">report</option>
                        <option value="document">document</option>
                        <option value="presentation">presentation</option>
                        <option value="other">other</option>
                      </select>
                    </div>

                    <div className="w-48">
                      <label className="block text-sm text-white/85 mb-1">Choose File *</label>
                      <input type="file" onChange={(e) => setFile(e.target.files[0])} className="w-full rounded-md border border-white/12 bg-white text-black px-3 py-2" />
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="flex-1">
                      <label className="block text-sm text-white/85 mb-1">Visible To Type</label>
                      <select value={visibleToType} onChange={(e) => { setVisibleToType(e.target.value); setVisibleTo(""); }} className="w-full rounded-md border border-white/12 bg-white text-black px-3 py-2">
                        <option value="Department">Department</option>
                        <option value="Organization">Organization</option>
                        <option value="User">User</option>
                      </select>
                    </div>

                    <div className="flex-1">
                      <label className="block text-sm text-white/85 mb-1">Visible To</label>
                      <select value={visibleTo} onChange={(e) => setVisibleTo(e.target.value)} className="w-full rounded-md border border-white/12 bg-white text-black px-3 py-2">
                        <option value="">Select {visibleToType}</option>
                        {getVisibleOptions().map((o) => (
                          <option key={o._id} value={o._id}>
                            {o.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {message && <div className="text-sm text-white/90">{message}</div>}
                </div>

                <div className="lg:col-span-1 flex flex-col gap-3">
                  <div className="preview-box">
                    <div className="text-xs text-white/70 mb-2">Preview</div>
                    <div className="text-sm font-semibold text-white truncate">{file?.name || "No file chosen"}</div>
                    <div className="text-xs text-white/70 mt-2">{type ? `Type: ${type}` : "Type: - "}</div>
                    <div className="text-xs text-white/70">{visibleTo ? `Visible: ${visibleTo}` : "Visible: - "}</div>
                  </div>

                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" className="btn-gradient w-full py-2 text-sm font-medium">
                    {loading ? "Uploading..." : "🚀 Upload Secure File"}
                  </motion.button>

                  <button type="button" onClick={() => { setFile(null); setDescription(""); setType(""); setVisibleTo(""); setVisibleToType("Department"); setMessage(""); }} className="w-full py-2 rounded-md border border-white/12 text-white/90 bg-white/4 hover:bg-white/6 text-sm">
                    Clear
                  </button>
                </div>
              </motion.form>
            </motion.section>
          ) : (
            <motion.section key="visible" initial="hidden" animate="visible" exit="hidden" variants={container}>
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-white">📁 Visible Files</h2>
                  <div className="mt-1 text-sm text-white/70">Files shared with you</div>
                </div>
                <div className="text-sm text-white/70">
                  <span className="font-semibold text-white">{files.length}</span> files
                </div>
              </div>

              {loading ? (
                <div className="rounded-xl p-6 bg-white/4 border border-white/8">
                  <Loader />
                </div>
              ) : files.length === 0 ? (
                <div className="rounded-xl p-6 bg-white/6 border border-white/8">
                  <EmptyState />
                </div>
              ) : (
                <motion.div variants={container} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {files.map((f) => (
                    <motion.article
                      key={f._id || f.id}
                      variants={card}
                      whileHover={{ scale: 1.04, y: -3, boxShadow: "0 16px 32px rgba(0,0,0,0.25)" }}
                      className="card-glass relative p-5 overflow-hidden"
                    >
                      <div className="absolute inset-0 pointer-events-none rounded-2xl" style={{ background: "linear-gradient(90deg,#3b82f6, #06b6d4)", opacity: 0.05, filter: "blur(12px)" }} />

                      <div className="relative z-10">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 pr-4">
                            <h3 className="text-white text-lg font-semibold mb-2 truncate">{f.description || f.originalName || "Untitled file"}</h3>
                            <div className="flex items-center gap-2 mb-2">
                              <FileTypePill type={f.type || "other"} />
                              <div className="text-xs text-white/70">{f.organization?.name || "—"}</div>
                            </div>
                            <div className="text-xs text-white/70">
                              Uploaded by <span className="font-medium text-white">{f.uploadedBy?.name || "Unknown"}</span>
                              <span className="mx-2">•</span>
                              <span>{fmtDate(f.uploadedAt)}</span>
                            </div>
                          </div>

                          <div className="flex flex-col items-end gap-2">
                            <button onClick={() => handleDownload(f._id || f.id, f.originalName)} className={`flex items-center gap-2 text-xs px-3 py-1 rounded-md ${downloadingFileId === (f._id || f.id) ? "bg-white text-black" : "btn-gradient text-black"}`}>
                              <FiDownload />
                              <span>Download</span>
                            </button>

                            {(f.uploadedBy?._id === user?.id || user?.role === "superAdmin") && (
                              <button onClick={() => handleDelete(f)} className="text-xs px-3 py-1 rounded-md border border-red-500 text-red-400 hover:bg-red-600/10">
                                <FiTrash2 />
                                <span className="ml-1">Delete</span>
                              </button>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="absolute left-4 right-4 bottom-3 h-[1px] bg-white/6 rounded" />
                    </motion.article>
                  ))}
                </motion.div>
              )}
            </motion.section>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default FilesDashboard;
