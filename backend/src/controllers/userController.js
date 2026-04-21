const mongoose = require("mongoose");
const User = require("../models/User");
const Profile = require("../models/Profile");
const { formatUser, formatProfile } = require("../utils/formatters");

/**
 * Returns authenticated user with linked profile.
 */
const getCurrentUserProfile = async (req, res, next) => {
  try {
    const profile = await Profile.findOne({ userId: req.user._id });

    return res.status(200).json({
      user: formatUser(req.user),
      profile: formatProfile(profile),
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Updates user profile fields and optionally updates basic user fields.
 */
const updateCurrentUserProfile = async (req, res, next) => {
  try {
    const { name, bio, skills, cvPath, cvText } = req.body;

    if (name) {
      req.user.name = name;
      await req.user.save();
    }

    const updatePayload = {};
    if (typeof bio === "string") updatePayload.bio = bio;
    if (typeof cvPath === "string") updatePayload.cvPath = cvPath;
    if (typeof cvText === "string") updatePayload.cvText = cvText;
    if (Array.isArray(skills)) {
      updatePayload.skills = skills.map((skill) => String(skill).trim()).filter(Boolean);
    }

    const profile = await Profile.findOneAndUpdate(
      { userId: req.user._id },
      { $set: updatePayload },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    return res.status(200).json({
      message: "Profile updated successfully.",
      user: formatUser(req.user),
      profile: formatProfile(profile),
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Admin endpoint to list all users and their profiles.
 */
const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find({}).select("-password").sort({ createdAt: -1 });
    const userIds = users.map((user) => user._id);
    const profiles = await Profile.find({ userId: { $in: userIds } });

    const profilesMap = new Map(profiles.map((profile) => [String(profile.userId), profile]));
    const result = users.map((user) => {
      const profileDoc = profilesMap.get(String(user._id)) || null;
      return {
        ...formatUser(user),
        profile: formatProfile(profileDoc),
      };
    });

    return res.status(200).json({ users: result });
  } catch (error) {
    return next(error);
  }
};

/**
 * Admin endpoint to create a user.
 */
const createUser = async (req, res, next) => {
  try {
    const { name, email, role } = req.body;

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({ message: "Email already in use." });
    }

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      role: role || "candidat",
      // Admin-created users use a placeholder password and should reset via auth flow.
      password: `temp_${new mongoose.Types.ObjectId()}`,
    });

    await Profile.create({ userId: user._id });

    return res.status(201).json({
      message: "User created successfully.",
      user: formatUser(user),
      profile: null,
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Admin endpoint to get one user with profile.
 */
const getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const profile = await Profile.findOne({ userId: user._id });
    return res.status(200).json({
      user: formatUser(user),
      profile: formatProfile(profile),
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Admin endpoint to update a user and optional profile fields.
 */
const updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, email, role, bio, skills, cvPath, cvText } = req.body;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    if (typeof name === "string") user.name = name;
    if (typeof role === "string") user.role = role;

    if (typeof email === "string" && email.toLowerCase() !== user.email) {
      const emailTaken = await User.findOne({ email: email.toLowerCase(), _id: { $ne: id } });
      if (emailTaken) {
        return res.status(409).json({ message: "Email already in use." });
      }
      user.email = email.toLowerCase();
    }

    await user.save();

    const profileUpdate = {};
    if (typeof bio === "string") profileUpdate.bio = bio;
    if (Array.isArray(skills)) {
      profileUpdate.skills = skills.map((skill) => String(skill).trim()).filter(Boolean);
    }
    if (typeof cvPath === "string") profileUpdate.cvPath = cvPath;
    if (typeof cvText === "string") profileUpdate.cvText = cvText;

    const profile = await Profile.findOneAndUpdate(
      { userId: user._id },
      { $set: profileUpdate },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    return res.status(200).json({
      message: "User updated successfully.",
      user: formatUser(user),
      profile: formatProfile(profile),
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Admin endpoint to delete user and profile documents.
 */
const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid user ID." });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    await Promise.all([User.deleteOne({ _id: id }), Profile.deleteOne({ userId: id })]);

    return res.status(200).json({ message: "User deleted successfully." });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getCurrentUserProfile,
  updateCurrentUserProfile,
  getAllUsers,
  createUser,
  getUserById,
  updateUser,
  deleteUser,
};
