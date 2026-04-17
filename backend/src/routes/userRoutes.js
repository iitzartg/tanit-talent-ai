const express = require("express");
const { body, param } = require("express-validator");
const {
  getCurrentUserProfile,
  updateCurrentUserProfile,
  getAllUsers,
  createUser,
  getUserById,
  updateUser,
  deleteUser,
} = require("../controllers/userController");
const { protect } = require("../middlewares/authMiddleware");
const { authorizeRoles } = require("../middlewares/roleMiddleware");
const validateRequest = require("../middlewares/validateRequest");

const router = express.Router();

router.get("/me", protect, getCurrentUserProfile);

router.put(
  "/me",
  protect,
  [
    body("name").optional().trim().isLength({ min: 2 }).withMessage("Name must be at least 2 characters."),
    body("bio").optional().isString().isLength({ max: 2000 }).withMessage("Bio is too long."),
    body("skills").optional().isArray().withMessage("Skills must be an array."),
    body("skills.*").optional().isString().withMessage("Each skill must be a string."),
    body("cvPath").optional().isString().withMessage("cvPath must be a string."),
  ],
  validateRequest,
  updateCurrentUserProfile
);

router.get("/", protect, authorizeRoles("admin"), getAllUsers);
router.post(
  "/",
  protect,
  authorizeRoles("admin"),
  [
    body("name").trim().isLength({ min: 2, max: 100 }).withMessage("Name must be 2 to 100 characters."),
    body("email").isEmail().withMessage("A valid email is required.").normalizeEmail(),
    body("role")
      .optional()
      .isIn(["candidat", "recruteur", "admin"])
      .withMessage("Role must be candidat, recruteur, or admin."),
  ],
  validateRequest,
  createUser
);
router.get(
  "/:id",
  protect,
  authorizeRoles("admin"),
  [param("id").isMongoId().withMessage("Invalid user ID.")],
  validateRequest,
  getUserById
);
router.put(
  "/:id",
  protect,
  authorizeRoles("admin"),
  [
    param("id").isMongoId().withMessage("Invalid user ID."),
    body("name").optional().trim().isLength({ min: 2 }).withMessage("Name must be at least 2 characters."),
    body("email").optional().isEmail().withMessage("A valid email is required.").normalizeEmail(),
    body("role")
      .optional()
      .isIn(["candidat", "recruteur", "admin"])
      .withMessage("Role must be candidat, recruteur, or admin."),
    body("bio").optional().isString().isLength({ max: 2000 }).withMessage("Bio is too long."),
    body("skills").optional().isArray().withMessage("Skills must be an array."),
    body("skills.*").optional().isString().withMessage("Each skill must be a string."),
    body("cvPath").optional().isString().withMessage("cvPath must be a string."),
  ],
  validateRequest,
  updateUser
);

router.delete(
  "/:id",
  protect,
  authorizeRoles("admin"),
  [param("id").isMongoId().withMessage("Invalid user ID.")],
  validateRequest,
  deleteUser
);

module.exports = router;
