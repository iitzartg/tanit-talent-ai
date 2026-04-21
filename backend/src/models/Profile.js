const mongoose = require("mongoose");

const profileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    bio: {
      type: String,
      trim: true,
      maxlength: 2000,
      default: "",
    },
    skills: {
      type: [String],
      default: [],
    },
    cvPath: {
      type: String,
      trim: true,
      default: "",
    },
    cvText: {
      type: String,
      trim: true,
      maxlength: 100000,
      default: "",
    },
  },
  {
    timestamps: { createdAt: false, updatedAt: true },
  }
);

module.exports = mongoose.model("Profile", profileSchema);
