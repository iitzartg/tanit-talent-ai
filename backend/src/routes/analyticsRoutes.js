const express = require("express");
const { getDashboardAnalytics, getSystemHealth } = require("../controllers/analyticsController");
const { protect } = require("../middlewares/authMiddleware");
const { authorizeRoles } = require("../middlewares/roleMiddleware");

const router = express.Router();

// All analytics endpoints require admin authentication
router.get("/dashboard", protect, authorizeRoles("admin"), getDashboardAnalytics);
router.get("/health", protect, authorizeRoles("admin"), getSystemHealth);

module.exports = router;
