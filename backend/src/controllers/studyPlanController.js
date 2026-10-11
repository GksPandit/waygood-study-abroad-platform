
const asyncHandler = require("../utils/asyncHandler");
const HttpError = require("../utils/httpError");
const Student = require("../models/Student");

const generateStudyPlan = asyncHandler(async (req, res) => {
  const student = await Student.findById(req.user._id).select("-password");

  if (!student) {
    throw new HttpError(404, "Student profile not found.");
  }

  const countries = student.targetCountries || [];
  const fields = student.interestedFields || [];
  const budget = student.maxBudgetUsd || 0;
  const englishScore = student.englishTest?.score || 0;

  const steps = [
    {
      step: 1,
      title: "Shortlist universities",
      description: countries.length
        ? `Research universities in ${countries.join(", ")}.`
        : "Choose your preferred study destination."
    },
    {
      step: 2,
      title: "Choose your study program",
      description: fields.length
        ? `Explore programs related to ${fields.join(", ")}.`
        : "Identify your preferred field of study."
    },
    {
      step: 3,
      title: "Review your budget",
      description: budget
        ? `Compare tuition and living costs against your budget of USD ${budget}.`
        : "Set a realistic budget for tuition and living expenses."
    },
    {
      step: 4,
      title: "Prepare English proficiency documents",
      description: englishScore
        ? `Your current English test score is ${englishScore}. Check each program's required IELTS score.`
        : "Check IELTS requirements and plan your English test preparation."
    },
    {
      step: 5,
      title: "Prepare your application",
      description: "Prepare transcripts, passport, statement of purpose, recommendation letters, and other required documents."
    }
  ];

  res.status(200).json({
    success: true,
    data: {
      student: student.fullName,
      preferences: {
        countries,
        fields,
        budgetUsd: budget,
        englishScore
      },
      studyPlan: steps
    },
    meta: {
      type: "rule-based",
      note: "This plan provides general guidance and is not an AI-generated assessment."
    }
  });
});

module.exports = { generateStudyPlan };
