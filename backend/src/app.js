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
const errorHandler = require("./middlewares/errorMiddleware");

const app = express();

// Global middlewares for security, logging and JSON body parsing.
app.use(helmet());
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());

// Health check route used by monitoring or deployment probes.
app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "ok", message: "API is healthy." });
});

// API routes.
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/applications", applicationRoutes);

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
