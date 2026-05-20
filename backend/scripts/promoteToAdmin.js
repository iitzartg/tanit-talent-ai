require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../src/models/User");

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/espace_utilisateur";

async function promoteToAdmin(email) {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✓ Connected to MongoDB\n");

    const emailLower = email.toLowerCase();
    const user = await User.findOne({ email: emailLower });

    if (!user) {
      console.log("✗ User not found:", email);
      process.exit(1);
    }

    if (user.role === "admin") {
      console.log("✓ User is already admin");
      process.exit(0);
    }

    user.role = "admin";
    await user.save();

    console.log("✓ User promoted to admin!");
    console.log("\n📧 Admin Details:");
    console.log("   Email:", user.email);
    console.log("   Name:", user.name);
    console.log("   Role: admin");
    console.log("   Clerk ID:", user.clerkId || "Not linked (will link on next sign-in)");

    process.exit(0);
  } catch (error) {
    console.error("✗ Error:", error.message);
    process.exit(1);
  }
}

const email = process.argv[2];
if (!email) {
  console.log("Usage: node scripts/promoteToAdmin.js <email>");
  process.exit(1);
}

promoteToAdmin(email);
