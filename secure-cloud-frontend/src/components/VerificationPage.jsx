import { useState, useEffect } from "react";
import api from "../services/api"; // your axios instance

const VerificationPage = () => {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState("loading");
  const [loading, setLoading] = useState(false);
  const [reason, setReason] = useState("");

  // --- Load user's verification status on mount
  useEffect(() => {
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    try {
      const res = await api.get("/verification/status");
      setStatus(res.data.status);
      setReason(res.data.reason || "");
    } catch (err) {
      console.error(err);
      setStatus("none");
    }
  };

  const handleUpload = async () => {
    if (!file) {
      alert("Upload a PDF first!");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("document", file);

      const res = await api.post("/verification/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert("Verification request submitted!");
      fetchStatus();
    } catch (err) {
      console.error(err);
      alert("Upload failed!");
    }

    setLoading(false);
  };

  return (
    <div className="p-6 max-w-xl mx-auto">

      <h1 className="text-3xl font-semibold mb-4">Super Admin Verification</h1>

      {status === "loading" ? (
        <p>Loading...</p>
      ) : status === "approved" ? (
        <div className="bg-green-100 p-4 rounded shadow">
          <h2 className="text-lg font-bold text-green-700">You are verified!</h2>
          <p>You can now create organizations.</p>
        </div>
      ) : status === "pending" ? (
        <div className="bg-yellow-100 p-4 rounded shadow">
          <h2 className="text-lg font-bold text-yellow-700">Pending Review</h2>
          <p>Your verification request is under processing.</p>
        </div>
      ) : status === "rejected" ? (
        <div className="bg-red-100 p-4 rounded shadow">
          <h2 className="text-lg font-bold text-red-700">Rejected</h2>
          <p className="text-red-600">Reason: {reason}</p>
          <p className="text-sm mt-2">Please upload a valid proof.</p>
        </div>
      ) : (
        <div>
          <p className="mb-4 text-gray-600">
            Upload an official document proving you are a CEO, Head, Founder, or equivalent.
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
            {loading ? "Uploading..." : "Submit for Verification"}
          </button>
        </div>
      )}
    </div>
  );
};

export default VerificationPage;
