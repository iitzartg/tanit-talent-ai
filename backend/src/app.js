require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const jobRoutes = require("./routes/jobRoutes");
const applicationRoutes = require("./routes/applicationRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");
const errorHandler = require("./middlewares/errorMiddleware");

const app = express();

// Global middlewares for security, logging and JSON body parsing.
app.use(helmet());
app.use(cors({
  origin: process.env.NODE_ENV === "production" 
    ? "https://tanit-talent-ai-virid.vercel.app"
    : "http://localhost:5173",
  credentials: true
}));
app.use(morgan("dev"));
app.use(express.json());

// Health check route used by monitoring or deployment probes.
app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "ok", message: "API is healthy." });
});

// Root route handler.
app.get("/", (req, res) => {
  res.status(200).json({ message: "Welcome to the Tanit Talent AI Backend API!" });
});

// API routes.
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/analytics", analyticsRoutes);

// 404 handler for unknown routes.
app.use((req, res) => {
  res.status(404).json({ message: "Route not found." });
});

// Central error handler should be last.
app.use(errorHandler);

const PORT = process.env.PORT || 5001;

// Start server only when file is executed directly.
if (require.main === module) {
  connectDB().then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  });
}

module.exports = app;
