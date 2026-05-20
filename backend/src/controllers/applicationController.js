const Application = require("../models/Application");
const Job = require("../models/Job");
const User = require("../models/User");
const Profile = require("../models/Profile");
const {
  formatApplication,
  formatJob,
  formatUser,
  formatProfile,
} = require("../utils/formatters");
const { computeApplicationAiScore } = require("../services/cvScoringService");

const applyToJob = async (req, res, next) => {
  try {
    const { jobId, cvPath, cvText } = req.body;
    const job = await Job.findById(jobId);
    if (!job || job.status !== "active") {
      return res
        .status(404)
        .json({ message: "Job not found or not open for applications." });
    }

    const existing = await Application.findOne({
      jobId: job._id,
      candidateId: req.user._id,
    });
    if (existing) {
      return res
        .status(409)
        .json({ message: "You already applied to this job." });
    }

    const profile = await Profile.findOne({ userId: req.user._id });
    const cvTextSnapshot =
      typeof cvText === "string" ? cvText.trim().slice(0, 100000) : "";
    const aiScore = await computeApplicationAiScore({
      job,
      profile,
      candidateTextOverride: cvTextSnapshot,
    });

    const application = await Application.create({
      jobId: job._id,
      candidateId: req.user._id,
      status: "pending",
      aiScore,
      cvPath: typeof cvPath === "string" ? cvPath.trim() : "",
      cvTextSnapshot,
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
    const applications = await Application.find({
      candidateId: req.user._id,
    }).sort({ createdAt: -1 });
    const jobs = await Job.find({
      _id: { $in: applications.map((app) => app.jobId) },
    });
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
    const jobs = await Job.find({ recruiterId: req.user._id }).sort({
      createdAt: -1,
    });
    const jobIds = jobs.map((job) => job._id);

    if (jobIds.length === 0) {
      return res.status(200).json({ applications: [] });
    }

    const applications = await Application.find({
      jobId: { $in: jobIds },
    }).sort({ createdAt: -1 });
    const candidateIds = applications.map((app) => app.candidateId);
    const candidates = await User.find({ _id: { $in: candidateIds } }).select(
      "-password",
    );
    const profiles = await Profile.find({ userId: { $in: candidateIds } });

    const jobsMap = new Map(jobs.map((job) => [String(job._id), job]));
    const candidatesMap = new Map(
      candidates.map((candidate) => [String(candidate._id), candidate]),
    );
    const profilesMap = new Map(
      profiles.map((profile) => [String(profile.userId), profile]),
    );

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

const toggleShortlist = async (req, res, next) => {
  try {
    const { applicationId } = req.params;

    // Get the application
    const application = await Application.findById(applicationId);
    if (!application) {
      return res.status(404).json({ message: "Application not found." });
    }

    // Get the job to verify recruiter ownership
    const job = await Job.findById(application.jobId);
    if (!job) {
      return res.status(404).json({ message: "Job not found." });
    }

    // Verify that the current user is the recruiter of this job
    if (String(job.recruiterId) !== String(req.user._id)) {
      return res
        .status(403)
        .json({ message: "You are not authorized to shortlist for this job." });
    }

    // Toggle shortlist status and update application status
    application.isShortlisted = !application.isShortlisted;
    if (application.isShortlisted) {
      application.status = "shortlisted";
    } else {
      application.status = "pending";
    }
    await application.save();

    // Get full application details for response
    const candidate = await User.findById(application.candidateId).select(
      "-password",
    );
    const profile = await Profile.findOne({ userId: application.candidateId });

    return res.status(200).json({
      message: application.isShortlisted
        ? "Candidate shortlisted successfully."
        : "Candidate removed from shortlist.",
      application: {
        ...formatApplication(application),
        job: formatJob(job),
        candidate: formatUser(candidate),
        profile: formatProfile(profile),
      },
    });
  } catch (error) {
    return next(error);
  }
};

const getRecruiterShortlist = async (req, res, next) => {
  try {
    // Get all jobs for this recruiter
    const jobs = await Job.find({ recruiterId: req.user._id }).sort({
      createdAt: -1,
    });
    const jobIds = jobs.map((job) => job._id);

    if (jobIds.length === 0) {
      return res.status(200).json({ applications: [] });
    }

    // Get shortlisted applications
    const applications = await Application.find({
      jobId: { $in: jobIds },
      isShortlisted: true,
    }).sort({ createdAt: -1 });

    const candidateIds = applications.map((app) => app.candidateId);
    const candidates = await User.find({ _id: { $in: candidateIds } }).select(
      "-password",
    );
    const profiles = await Profile.find({ userId: { $in: candidateIds } });

    const jobsMap = new Map(jobs.map((job) => [String(job._id), job]));
    const candidatesMap = new Map(
      candidates.map((candidate) => [String(candidate._id), candidate]),
    );
    const profilesMap = new Map(
      profiles.map((profile) => [String(profile.userId), profile]),
    );

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

const getCandidateCV = async (req, res, next) => {
  try {
    const { applicationId } = req.params;

    // Get the application
    const application = await Application.findById(applicationId);
    if (!application) {
      return res.status(404).json({ message: "Application not found." });
    }

    // Get the job to verify recruiter ownership
    const job = await Job.findById(application.jobId);
    if (!job) {
      return res.status(404).json({ message: "Job not found." });
    }

    // Verify that the current user is the recruiter of this job
    if (String(job.recruiterId) !== String(req.user._id)) {
      return res
        .status(403)
        .json({ message: "You are not authorized to view this CV." });
    }

    // Get candidate details
    const candidate = await User.findById(application.candidateId).select(
      "-password",
    );
    const profile = await Profile.findOne({ userId: application.candidateId });

    return res.status(200).json({
      cvText: application.cvTextSnapshot,
      candidate: formatUser(candidate),
      profile: formatProfile(profile),
      application: formatApplication(application),
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  applyToJob,
  getMyApplications,
  getRecruiterApplications,
  toggleShortlist,
  getRecruiterShortlist,
  getCandidateCV,
};
