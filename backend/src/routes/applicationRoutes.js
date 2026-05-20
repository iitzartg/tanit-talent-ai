const express = require("express");
const { body } = require("express-validator");
const {
  applyToJob,
  getMyApplications,
  getRecruiterApplications,
  toggleShortlist,
  getRecruiterShortlist,
  getCandidateCV,
} = require("../controllers/applicationController");
const { protect } = require("../middlewares/authMiddleware");
const { authorizeRoles } = require("../middlewares/roleMiddleware");
const validateRequest = require("../middlewares/validateRequest");

const router = express.Router();

router.post(
  "/",
  protect,
  authorizeRoles("candidat"),
  [
    body("jobId").isMongoId().withMessage("A valid jobId is required."),
    body("cvPath")
      .trim()
      .isLength({ min: 1 })
      .withMessage("CV file name is required."),
    body("cvText")
      .isString()
      .isLength({ min: 50, max: 100000 })
      .withMessage("Valid CV content is required."),
  ],
  validateRequest,
  applyToJob,
);

router.get("/me", protect, authorizeRoles("candidat"), getMyApplications);
router.get(
  "/recruiter/shortlist",
  protect,
  authorizeRoles("recruteur", "admin"),
  getRecruiterShortlist,
);
router.get(
  "/recruiter",
  protect,
  authorizeRoles("recruteur", "admin"),
  getRecruiterApplications,
);
router.post(
  "/:applicationId/shortlist",
  protect,
  authorizeRoles("recruteur", "admin"),
  toggleShortlist,
);
router.get(
  "/:applicationId/cv",
  protect,
  authorizeRoles("recruteur", "admin"),
  getCandidateCV,
);

module.exports = router;
