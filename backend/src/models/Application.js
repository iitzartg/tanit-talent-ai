const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema(
  {
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: true,
      index: true,
    },
    candidateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["pending", "reviewed", "shortlisted", "rejected"],
      default: "pending",
    },
    aiScore: {
      type: Number,
      min: 0,
      max: 1,
      default: 0,
    },
    cvPath: {
      type: String,
      trim: true,
      default: "",
    },
    cvTextSnapshot: {
      type: String,
      trim: true,
      maxlength: 100000,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

applicationSchema.index({ jobId: 1, candidateId: 1 }, { unique: true });

module.exports = mongoose.model("Application", applicationSchema);
