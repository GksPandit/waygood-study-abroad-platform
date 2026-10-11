
const mongoose = require("mongoose");
const Program = require("../models/Program");
const Student = require("../models/Student");
const HttpError = require("../utils/httpError");

async function buildProgramRecommendations(studentId) {
  if (!mongoose.Types.ObjectId.isValid(studentId)) {
    throw new HttpError(400, "Invalid student ID.");
  }

  const student = await Student.findById(studentId).lean();

  if (!student) {
    throw new HttpError(404, "Student not found.");
  }

  const targetCountries = student.targetCountries || [];
  const interestedFields = student.interestedFields || [];
  const preferredIntake = student.preferredIntake || "";
  const maxBudget = student.maxBudgetUsd || 0;
  const englishScore = student.englishTest?.score || 0;

  const recommendations = await Program.aggregate([
    {
      $match: {
        country: { $in: targetCountries },
      },
    },
    {
      $addFields: {
        countryMatch: {
          $in: ["$country", targetCountries],
        },
        fieldMatch: {
          $gt: [
            {
              $size: {
                $filter: {
                  input: interestedFields,
                  as: "field",
                  cond: {
                    $regexMatch: {
                      input: "$field",
                      regex: "$$field",
                      options: "i",
                    },
                  },
                },
              },
            },
            0,
          ],
        },
        budgetMatch: {
          $lte: ["$tuitionFeeUsd", maxBudget],
        },
        intakeMatch: {
          $in: [preferredIntake, "$intakes"],
        },
        englishMatch: {
          $gte: [englishScore, "$minimumIelts"],
        },
      },
    },
    {
      $addFields: {
        matchScore: {
          $add: [
            { $cond: ["$countryMatch", 35, 0] },
            { $cond: ["$fieldMatch", 30, 0] },
            { $cond: ["$budgetMatch", 20, 0] },
            { $cond: ["$intakeMatch", 10, 0] },
            { $cond: ["$englishMatch", 5, 0] },
          ],
        },
        reasons: {
          $concatArrays: [
            {
              $cond: [
                "$countryMatch",
                [{ $concat: ["Preferred country match: ", "$country"] }],
                [],
              ],
            },
            {
              $cond: [
                "$fieldMatch",
                [{ $concat: ["Field alignment: ", "$field"] }],
                [],
              ],
            },
            {
              $cond: [
                "$budgetMatch",
                ["Within budget range"],
                [],
              ],
            },
            {
              $cond: [
                "$intakeMatch",
                [{ $concat: ["Preferred intake available: ", preferredIntake] }],
                [],
              ],
            },
            {
              $cond: [
                "$englishMatch",
                ["English test score meets requirement"],
                [],
              ],
            },
          ],
        },
      },
    },
    {
      $sort: {
        matchScore: -1,
        tuitionFeeUsd: 1,
        _id: 1,
      },
    },
    { $limit: 5 },
    {
      $project: {
        name: 0,
        countryMatch: 0,
        fieldMatch: 0,
        budgetMatch: 0,
        intakeMatch: 0,
        englishMatch: 0,
      },
    },
  ]);

  return {
    data: {
      student: {
        id: student._id,
        fullName: student.fullName,
        targetCountries,
        interestedFields,
      },
      recommendations,
    },
    meta: {
      count: recommendations.length,
      implementationStatus: "mongodb-aggregation",
    },
  };
}

module.exports = {
  buildProgramRecommendations,
};
