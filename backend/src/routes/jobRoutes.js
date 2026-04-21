const express = require("express");
const { body, param } = require("express-validator");
const { listJobs, createJob, updateJob, deleteJob } = require("../controllers/jobController");
const { protect } = require("../middlewares/authMiddleware");
const { authorizeRoles } = require("../middlewares/roleMiddleware");
const validateRequest = require("../middlewares/validateRequest");

const router = express.Router();

router.get("/", listJobs);
router.get("/mine", protect, authorizeRoles("recruteur", "admin"), (req, res, next) => {
  req.query.mine = "true";
  return listJobs(req, res, next);
});

router.post(
  "/",
  protect,
  authorizeRoles("recruteur", "admin"),
  [
    body("title").trim().isLength({ min: 3, max: 120 }).withMessage("Title must be 3 to 120 characters."),
    body("company").trim().isLength({ min: 2, max: 120 }).withMessage("Company must be 2 to 120 characters."),
    body("location").trim().isLength({ min: 2, max: 120 }).withMessage("Location must be 2 to 120 characters."),
    body("type")
      .isIn(["Full-time", "Part-time", "Contract", "Remote"])
      .withMessage("Type must be Full-time, Part-time, Contract, or Remote."),
    body("salary").trim().notEmpty().withMessage("Salary is required."),
    body("description")
      .trim()
      .isLength({ min: 20, max: 4000 })
      .withMessage("Description must be 20 to 4000 characters."),
    body("requirements").optional().isArray().withMessage("Requirements must be an array."),
    body("requirements.*").optional().isString().withMessage("Each requirement must be a string."),
    body("status")
      .optional()
      .isIn(["active", "closed", "draft"])
      .withMessage("Status must be active, closed, or draft."),
  ],
  validateRequest,
  createJob
);

router.put(
  "/:id",
  protect,
  authorizeRoles("recruteur", "admin"),
  [
    param("id").isMongoId().withMessage("Invalid job ID."),
    body("title").trim().isLength({ min: 3, max: 120 }).withMessage("Title must be 3 to 120 characters."),
    body("company").trim().isLength({ min: 2, max: 120 }).withMessage("Company must be 2 to 120 characters."),
    body("location").trim().isLength({ min: 2, max: 120 }).withMessage("Location must be 2 to 120 characters."),
    body("type")
      .isIn(["Full-time", "Part-time", "Contract", "Remote"])
      .withMessage("Type must be Full-time, Part-time, Contract, or Remote."),
    body("salary").trim().notEmpty().withMessage("Salary is required."),
    body("description")
      .trim()
      .isLength({ min: 20, max: 4000 })
      .withMessage("Description must be 20 to 4000 characters."),
    body("requirements").optional().isArray().withMessage("Requirements must be an array."),
    body("requirements.*").optional().isString().withMessage("Each requirement must be a string."),
    body("status")
      .optional()
      .isIn(["active", "closed", "draft"])
      .withMessage("Status must be active, closed, or draft."),
  ],
  validateRequest,
  updateJob
);

router.delete(
  "/:id",
  protect,
  authorizeRoles("recruteur", "admin"),
  [param("id").isMongoId().withMessage("Invalid job ID.")],
  validateRequest,
  deleteJob
);

module.exports = router;
