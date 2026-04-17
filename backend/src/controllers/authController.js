const crypto = require("node:crypto");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { verifyToken, createClerkClient } = require("@clerk/backend");
const User = require("../models/User");
const Profile = require("../models/Profile");
const { formatUser } = require("../utils/formatters");

const generateToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });

const SELF_SERVICE_ROLES = new Set(["candidat", "recruteur"]);

/**
 * Registers a new user with hashed password and creates an empty profile.
 */
const register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "Email already in use." });
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
    });

    await Profile.create({ userId: user._id });

    const token = generateToken(user._id);
    return res.status(201).json({
      message: "User registered successfully.",
      token,
      user: formatUser(user),
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Logs in a user and returns a signed JWT token.
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const token = generateToken(user._id);
    return res.status(200).json({
      message: "Login successful.",
      token,
      user: formatUser(user),
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Verifies a Clerk session JWT, upserts the user in MongoDB, and returns the app's JWT (same as login).
 * Optional body.role (candidat | recruteur) is applied only when creating a new user.
 */
const clerkSync = async (req, res, next) => {
  try {
    if (!process.env.CLERK_SECRET_KEY) {
      return res.status(500).json({ message: "Server missing CLERK_SECRET_KEY." });
    }

    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Clerk token missing." });
    }

    const clerkToken = authHeader.split(" ")[1];
    const payload = await verifyToken(clerkToken, {
      secretKey: process.env.CLERK_SECRET_KEY,
    });

    const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });
    const clerkUser = await clerk.users.getUser(payload.sub);

    const primaryId = clerkUser.primaryEmailAddressId;
    const primary =
      clerkUser.emailAddresses.find((e) => e.id === primaryId) || clerkUser.emailAddresses[0];
    const email = primary?.emailAddress;
    if (!email) {
      return res.status(400).json({ message: "Clerk user has no verified email." });
    }

    const emailLower = email.toLowerCase();
    const nameFromClerk = [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ").trim();
    const name = nameFromClerk || emailLower.split("@")[0];

    const requestedRole =
      req.body?.role === "candidat" || req.body?.role === "recruteur" ? req.body.role : undefined;
    const newUserRole = requestedRole || "candidat";

    let user = await User.findOne({ clerkId: payload.sub });
    if (!user) {
      user = await User.findOne({ email: emailLower });
      if (user) {
        user.clerkId = payload.sub;
        if (requestedRole && SELF_SERVICE_ROLES.has(user.role) && user.role !== requestedRole) {
          user.role = requestedRole;
        }
        if (!user.name || user.name.length < 2) {
          user.name = name;
        }
        await user.save();
      }
    }

    if (user && requestedRole && SELF_SERVICE_ROLES.has(user.role) && user.role !== requestedRole) {
      user.role = requestedRole;
      await user.save();
    }

    if (!user) {
      const saltRounds = 10;
      const placeholder = await bcrypt.hash(crypto.randomBytes(32).toString("hex"), saltRounds);
      user = await User.create({
        name,
        email: emailLower,
        password: placeholder,
        role: newUserRole,
        clerkId: payload.sub,
      });
      await Profile.create({ userId: user._id });
    }

    const fresh = await User.findById(user._id).select("-password");
    const token = generateToken(fresh._id);
    return res.status(200).json({
      message: "Session synced.",
      token,
      user: formatUser(fresh),
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  register,
  login,
  clerkSync,
};
