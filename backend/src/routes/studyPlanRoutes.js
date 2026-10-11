
const express = require("express");
const { generateStudyPlan } = require("../controllers/studyPlanController");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

router.post("/", requireAuth, generateStudyPlan);

module.exports = router;
