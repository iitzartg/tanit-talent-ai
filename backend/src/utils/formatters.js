/**
 * Shapes Mongoose documents for JSON responses expected by the frontend (uses `id` string).
 */

function formatUser(userDoc) {
  if (!userDoc) return null;
  const u = userDoc.toObject ? userDoc.toObject({ virtuals: true }) : { ...userDoc };
  return {
    id: String(u._id ?? u.id),
    name: u.name,
    email: u.email,
    role: u.role,
    createdAt: u.createdAt,
  };
}

function formatProfile(profileDoc) {
  if (!profileDoc) return null;
  const p = profileDoc.toObject ? profileDoc.toObject() : { ...profileDoc };
  return {
    userId: String(p.userId),
    bio: p.bio ?? "",
    skills: Array.isArray(p.skills) ? p.skills : [],
    cvPath: p.cvPath ?? "",
    updatedAt: p.updatedAt,
  };
}

function formatJob(jobDoc) {
  if (!jobDoc) return null;
  const j = jobDoc.toObject ? jobDoc.toObject({ virtuals: true }) : { ...jobDoc };
  return {
    id: String(j._id ?? j.id),
    recruiterId: String(j.recruiterId),
    title: j.title,
    company: j.company,
    location: j.location,
    type: j.type,
    salary: j.salary,
    description: j.description,
    requirements: Array.isArray(j.requirements) ? j.requirements : [],
    status: j.status,
    postedAt: j.createdAt,
  };
}

function formatApplication(applicationDoc) {
  if (!applicationDoc) return null;
  const a = applicationDoc.toObject ? applicationDoc.toObject({ virtuals: true }) : { ...applicationDoc };
  return {
    id: String(a._id ?? a.id),
    jobId: String(a.jobId),
    candidateId: String(a.candidateId),
    status: a.status,
    aiScore: typeof a.aiScore === "number" ? a.aiScore : 0,
    appliedAt: a.createdAt,
  };
}

module.exports = { formatUser, formatProfile, formatJob, formatApplication };
