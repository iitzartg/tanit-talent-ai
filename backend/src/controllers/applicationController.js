const Application = require("../models/Application");
const Job = require("../models/Job");
const User = require("../models/User");
const Profile = require("../models/Profile");
const { formatApplication, formatJob, formatUser, formatProfile } = require("../utils/formatters");

const applyToJob = async (req, res, next) => {
  try {
    const { jobId } = req.body;
    const job = await Job.findById(jobId);
    if (!job || job.status !== "active") {
      return res.status(404).json({ message: "Job not found or not open for applications." });
    }

    const existing = await Application.findOne({
      jobId: job._id,
      candidateId: req.user._id,
    });
    if (existing) {
      return res.status(409).json({ message: "You already applied to this job." });
    }

    const application = await Application.create({
      jobId: job._id,
      candidateId: req.user._id,
      status: "pending",
      aiScore: 0,
    });

    return res.status(201).json({
      message: "Application submitted successfully.",
      application: {
        ...formatApplication(application),
        job: formatJob(job),
      },
    });
  } catch (error) {
    return next(error);
  }
};

const getMyApplications = async (req, res, next) => {
  try {
    const applications = await Application.find({ candidateId: req.user._id }).sort({ createdAt: -1 });
    const jobs = await Job.find({ _id: { $in: applications.map((app) => app.jobId) } });
    const jobsMap = new Map(jobs.map((job) => [String(job._id), job]));

    return res.status(200).json({
      applications: applications.map((application) => ({
        ...formatApplication(application),
        job: formatJob(jobsMap.get(String(application.jobId))),
      })),
    });
  } catch (error) {
    return next(error);
  }
};

const getRecruiterApplications = async (req, res, next) => {
  try {
    const jobs = await Job.find({ recruiterId: req.user._id }).sort({ createdAt: -1 });
    const jobIds = jobs.map((job) => job._id);

    if (jobIds.length === 0) {
      return res.status(200).json({ applications: [] });
    }

    const applications = await Application.find({ jobId: { $in: jobIds } }).sort({ createdAt: -1 });
    const candidateIds = applications.map((app) => app.candidateId);
    const candidates = await User.find({ _id: { $in: candidateIds } }).select("-password");
    const profiles = await Profile.find({ userId: { $in: candidateIds } });

    const jobsMap = new Map(jobs.map((job) => [String(job._id), job]));
    const candidatesMap = new Map(candidates.map((candidate) => [String(candidate._id), candidate]));
    const profilesMap = new Map(profiles.map((profile) => [String(profile.userId), profile]));

    return res.status(200).json({
      applications: applications.map((application) => {
        const candidate = candidatesMap.get(String(application.candidateId));
        const profile = profilesMap.get(String(application.candidateId));
        return {
          ...formatApplication(application),
          job: formatJob(jobsMap.get(String(application.jobId))),
          candidate: formatUser(candidate),
          profile: formatProfile(profile),
        };
      }),
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  applyToJob,
  getMyApplications,
  getRecruiterApplications,
};
