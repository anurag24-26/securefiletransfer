const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const authRoutes = require("./routes/auth");
const orgRoutes = require("./routes/org");
const userRoutes = require("./routes/user");

dotenv.config();
connectDB();

const app = express();
app.use(express.json());

// Test Route
app.get("/", (req, res) => {
  res.send("🚀 Secure Cloud Backend API is running...");
});

app.use("/auth", authRoutes);
app.use("/org", orgRoutes);
app.use("/users", userRoutes);
// server.js


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
