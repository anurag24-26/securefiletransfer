// server.js
const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");

// Import routes
const authRoutes = require("./routes/auth");
const orgRoutes = require("./routes/org");
const userRoutes = require("./routes/user");
const requestRoutes=require("./routes/requestRoutes");

dotenv.config();
connectDB();

const app = express();

// ✅ Enable CORS for your React frontend
app.use(
  cors({
    origin: "http://localhost:5173", // your frontend URL
    credentials: true, // allows cookies / authorization headers
  })
);

// ✅ Parse JSON body
app.use(express.json());

// ✅ Test Route
app.get("/", (req, res) => {
  res.send("🚀 Secure Cloud Backend API is running...");
});

// ✅ API Routes (with /api prefix to match frontend)
app.use("/api/auth", authRoutes);
app.use("/api/org", orgRoutes);
app.use("/api/users", userRoutes);
app.use("/api/requests",requestRoutes);
// ✅ Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));
