const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");
const path = require("path");

// Import routes
const authRoutes = require("./routes/auth");
const orgRoutes = require("./routes/org");
const userRoutes = require("./routes/user");
const requestRoutes = require("./routes/requestRoutes");
const fileRoutes = require("./routes/fileRoutes");

dotenv.config();
connectDB();

const app = express();

// ✅ CORS setup
const allowedOrigins = [
  "https://crypterracloud.vercel.app",
  "http://localhost:5173",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      else return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

app.use(express.json());

// ✅ Serve uploaded images (important!)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ✅ Routes
app.get("/", (req, res) => {
  res.send("🚀 Secure Cloud Backend API is running...");
});

app.use("/api/auth", authRoutes);
app.use("/api/org", orgRoutes);
app.use("/api/users", userRoutes);
app.use("/api/files", fileRoutes);
app.use("/api/requests", requestRoutes);

// ✅ Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));
