const Job = require("../models/Job");
const Application = require("../models/Application");
const { formatJob } = require("../utils/formatters");

const listJobs = async (req, res, next) => {
  try {
    const query = {};
    if (req.query.status) query.status = req.query.status;
    if (req.query.mine === "true" && req.user) {
      query.recruiterId = req.user._id;
    } else if (!req.query.status) {
      query.status = "active";
    }

    const jobs = await Job.find(query).sort({ createdAt: -1 });
    const jobIds = jobs.map((job) => job._id);
    const counts = await Application.aggregate([
      { $match: { jobId: { $in: jobIds } } },
      { $group: { _id: "$jobId", count: { $sum: 1 } } },
    ]);
    const countMap = new Map(counts.map((item) => [String(item._id), item.count]));

    return res.status(200).json({
      jobs: jobs.map((job) => ({
        ...formatJob(job),
        applicants: countMap.get(String(job._id)) || 0,
      })),
    });
  } catch (error) {
    return next(error);
  }
};

const createJob = async (req, res, next) => {
  try {
    const { title, company, location, type, salary, description, requirements, status } = req.body;
    const normalizedRequirements = Array.isArray(requirements)
      ? requirements.map((item) => String(item).trim()).filter(Boolean)
      : [];

    const job = await Job.create({
      recruiterId: req.user._id,
      title,
      company,
      location,
      type,
      salary,
      description,
      requirements: normalizedRequirements,
      status: status || "active",
    });

    return res.status(201).json({
      message: "Job posted successfully.",
      job: {
        ...formatJob(job),
        applicants: 0,
      },
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  listJobs,
  createJob,
};
