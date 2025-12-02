import { useState } from "react";
import api from "../services/api"; // your axios instance

const VerificationPage = () => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [fileUrl, setFileUrl] = useState("");

  const handleUpload = async () => {
    if (!file) {
      alert("Upload a PDF first!");
      return;
    }

    setLoading(true);
    setMessage("");
    setFileUrl("");

    try {
      const formData = new FormData();
      formData.append("document", file);

      const res = await api.post("/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setMessage(res.data.message);
      setFileUrl(res.data.fileUrl);
    } catch (err) {
      console.error(err);
      setMessage(err.response?.data?.message || "Upload failed!");
    }

    setLoading(false);
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-3xl font-semibold mb-4">PDF Verification</h1>

      <p className="mb-4 text-gray-600">
        Upload a PDF document. Only PDF files are allowed.
      </p>

      <input
        type="file"
        accept="application/pdf"
        className="mb-4"
        onChange={(e) => setFile(e.target.files[0])}
      />

      <button
        className="px-4 py-2 bg-blue-600 text-white rounded shadow hover:bg-blue-700"
        onClick={handleUpload}
        disabled={loading}
      >
        {loading ? "Uploading..." : "Upload PDF"}
      </button>

      {message && (
        <div
          className={`mt-4 p-4 rounded ${
            fileUrl ? "bg-green-100 text-green-800" : "bg-red-100 text-red-700"
          }`}
        >
          <p>{message}</p>
          {fileUrl && (
            <p className="mt-2">
              View file:{" "}
              <a
                href={fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="underline text-blue-600"
              >
                Open PDF
              </a>
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default VerificationPage;
