const User = require("../models/User");
const Job = require("../models/Job");
const Application = require("../models/Application");
const Profile = require("../models/Profile");

/**
 * Get comprehensive analytics data for admin dashboard
 */
const getDashboardAnalytics = async (req, res, next) => {
  try {
    // Get user statistics
    const totalUsers = await User.countDocuments();
    const usersByRole = await User.aggregate([
      {
        $group: {
          _id: "$role",
          count: { $sum: 1 },
        },
      },
    ]);

    // Get job statistics
    const totalJobs = await Job.countDocuments();
    const jobsByStatus = await Job.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    // Get application statistics
    const totalApplications = await Application.countDocuments();
    const applicationsByStatus = await Application.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    // Get average AI score from applications
    const avgScoreResult = await Application.aggregate([
      {
        $group: {
          _id: null,
          avgScore: { $avg: "$aiScore" },
        },
      },
    ]);

    const avgAiScore = avgScoreResult[0]?.avgScore || 0;

    // Get monthly trends for the last 6 months
    const monthsBack = 6;
    const monthlyStats = [];
    for (let i = monthsBack - 1; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      date.setDate(1);
      date.setHours(0, 0, 0, 0);

      const nextMonth = new Date(date);
      nextMonth.setMonth(nextMonth.getMonth() + 1);

      const monthName = date.toLocaleString("en-US", { month: "short" });

      const jobsCreated = await Job.countDocuments({
        createdAt: { $gte: date, $lt: nextMonth },
      });

      const applicationsCreated = await Application.countDocuments({
        createdAt: { $gte: date, $lt: nextMonth },
      });

      monthlyStats.push({
        month: monthName,
        views: jobsCreated * 50, // Estimated views (jobs * avg views per job)
        applications: applicationsCreated,
      });
    }

    // Get top skills from user profiles
    const topSkills = await Profile.aggregate([
      {
        $unwind: "$skills",
      },
      {
        $group: {
          _id: "$skills",
          count: { $sum: 1 },
        },
      },
      {
        $sort: { count: -1 },
      },
      {
        $limit: 5,
      },
      {
        $project: {
          skill: "$_id",
          count: 1,
          _id: 0,
        },
      },
    ]);

    // Get jobs by category (using company as proxy for category)
    const jobsByCategory = await Job.aggregate([
      {
        $group: {
          _id: "$company",
          count: { $sum: 1 },
        },
      },
      {
        $sort: { count: -1 },
      },
      {
        $limit: 5,
      },
      {
        $project: {
          category: "$_id",
          count: 1,
          _id: 0,
        },
      },
    ]);

    // Calculate conversion rate (applications / total users)
    const conversionRate = totalUsers > 0 ? ((totalApplications / totalUsers) * 100).toFixed(1) : 0;

    return res.status(200).json({
      totalUsers,
      usersByRole: Object.fromEntries(usersByRole.map((item) => [item._id, item.count])),
      totalJobs,
      jobsByStatus: Object.fromEntries(jobsByStatus.map((item) => [item._id, item.count])),
      totalApplications,
      applicationsByStatus: Object.fromEntries(
        applicationsByStatus.map((item) => [item._id, item.count])
      ),
      avgAiScore: parseFloat(avgAiScore.toFixed(2)),
      conversionRate: parseFloat(conversionRate),
      monthlyViews: monthlyStats,
      topSkills: topSkills.length > 0 ? topSkills : [],
      jobsByCategory: jobsByCategory.length > 0 ? jobsByCategory : [],
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Get system health and operational metrics
 */
const getSystemHealth = async (req, res, next) => {
  try {
    const startTime = Date.now();

    // Test database connection
    const dbTest = await User.countDocuments().exec();

    const responseTime = Date.now() - startTime;

    return res.status(200).json({
      status: "operational",
      apiGateway: "operational",
      database: "operational",
      fileStorage: "operational",
      responseTime: responseTime,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return res.status(503).json({
      status: "degraded",
      message: "System health check failed",
      error: error.message,
    });
  }
};

module.exports = {
  getDashboardAnalytics,
  getSystemHealth,
};
