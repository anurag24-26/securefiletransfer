import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../contexts/AuthContext";
import api from "../services/api";
import Loader from "../components/Loader";
import bgImage from "../assets/back1.jpg";

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
  if (!files.length)
    return (
      <div
        className="min-h-screen flex items-center justify-center bg-cover bg-center"
        style={{ backgroundImage: `url(${bgImage})` }}
      >
        <p className="text-white text-lg font-medium bg-white/20 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/30 shadow-xl">
          No files visible to you.
        </p>
      </div>
    );

  return (
    <div
      className="min-h-screen bg-cover bg-center py-16 px-6"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <motion.h2
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center text-4xl md:text-5xl font-extrabold text-white drop-shadow-lg mb-10"
      >
        Visible Files
      </motion.h2>

      <motion.div
        layout
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 max-w-7xl mx-auto"
      >
        <AnimatePresence>
          {files.map((file, index) => (
            <motion.div
              key={file._id}
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{
                duration: 0.4,
                delay: index * 0.05,
                type: "spring",
                stiffness: 100,
              }}
              className="relative bg-white/15 backdrop-blur-lg rounded-3xl p-6 border border-white/30 shadow-2xl hover:shadow-purple-700/40 transition duration-300"
            >
              <h3 className="text-xl font-semibold text-white mb-3 truncate">
                {file.originalName}
              </h3>

              <div className="text-gray-200 text-sm space-y-1">
                <p>
                  <span className="font-semibold text-purple-300">Type:</span>{" "}
                  {file.type || "N/A"}
                </p>
                <p>
                  <span className="font-semibold text-purple-300">
                    Uploaded By:
                  </span>{" "}
                  {file.uploadedBy?.name || "Unknown"}
                </p>
                <p>
                  <span className="font-semibold text-purple-300">
                    Visibility:
                  </span>{" "}
                  {file.visibleToType}
                </p>
              </div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleDownload(file.filename)}
                className="w-full mt-5 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-semibold shadow-lg hover:from-purple-600 hover:to-indigo-700 transition"
              >
                Download
              </motion.button>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default VisibleFiles;
