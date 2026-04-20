const express = require("express");
const { body } = require("express-validator");
const { register, login, clerkSync } = require("../controllers/authController");
const validateRequest = require("../middlewares/validateRequest");

const router = express.Router();

router.post(
  "/register",
  [
    body("name").trim().notEmpty().withMessage("Name is required."),
    body("email").isEmail().withMessage("A valid email is required.").normalizeEmail(),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters."),
    body("role")
      .optional()
      .isIn(["candidat", "recruteur", "admin"])
      .withMessage("Role must be candidat, recruteur, or admin."),
  ],
  validateRequest,
  register
);

router.post(
  "/login",
  [
    body("email").isEmail().withMessage("A valid email is required.").normalizeEmail(),
    body("password").notEmpty().withMessage("Password is required."),
  ],
  validateRequest,
  login
);

router.post(
  "/clerk-sync",
  [body("role").optional().isIn(["candidat", "recruteur"]).withMessage("Role must be candidat or recruteur.")],
  validateRequest,
  clerkSync
);

module.exports = router;
