
const Program = require("../models/Program");
const asyncHandler = require("../utils/asyncHandler");
const HttpError = require("../utils/httpError");

function parseBoolean(value) {
  if (value === "true") return true;
  if (value === "false") return false;
  return undefined;
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

const listPrograms = asyncHandler(async (req, res) => {
  const {
    country,
    degreeLevel,
    intake,
    field,
    q,
    maxTuition,
    scholarshipAvailable,
    sortBy = "relevance",
    page = "1",
    limit = "10",
  } = req.query;

  // Validate pagination
  const pageNumber = Number(page);
  const pageSize = Number(limit);

  if (
    !Number.isInteger(pageNumber) ||
    pageNumber < 1 ||
    !Number.isInteger(pageSize) ||
    pageSize < 1 ||
    pageSize > 50
  ) {
    throw new HttpError(
      400,
      "Page must be a positive integer and limit must be between 1 and 50."
    );
  }

  // Validate tuition budget
  let tuitionLimit;

  if (maxTuition !== undefined) {
    tuitionLimit = Number(maxTuition);

    if (!Number.isFinite(tuitionLimit) || tuitionLimit < 0) {
      throw new HttpError(
        400,
        "maxTuition must be a valid non-negative number."
      );
    }
  }

  // Validate scholarship filter
  if (
    scholarshipAvailable !== undefined &&
    parseBoolean(scholarshipAvailable) === undefined
  ) {
    throw new HttpError(
      400,
      "scholarshipAvailable must be true or false."
    );
  }

  const allowedSorts = ["relevance", "tuitionAsc", "tuitionDesc"];

  if (!allowedSorts.includes(sortBy)) {
    throw new HttpError(
      400,
      `sortBy must be one of: ${allowedSorts.join(", ")}.`
    );
  }

  const filters = {};

  if (country) filters.country = country;
  if (degreeLevel) filters.degreeLevel = degreeLevel;
  if (field) filters.field = field;
  if (intake) filters.intakes = intake;

  if (tuitionLimit !== undefined) {
    filters.tuitionFeeUsd = { $lte: tuitionLimit };
  }

  const scholarshipFlag = parseBoolean(scholarshipAvailable);

  if (scholarshipFlag !== undefined) {
    filters.scholarshipAvailable = scholarshipFlag;
  }

  if (q) {
    const search = escapeRegex(String(q).trim());

    if (search) {
      filters.$or = [
        { title: { $regex: search, $options: "i" } },
        { universityName: { $regex: search, $options: "i" } },
        { field: { $regex: search, $options: "i" } },
      ];
    }
  }

  const sortMap = {
    tuitionAsc: { tuitionFeeUsd: 1, _id: 1 },
    tuitionDesc: { tuitionFeeUsd: -1, _id: 1 },
    relevance: {
      scholarshipAvailable: -1,
      tuitionFeeUsd: 1,
      _id: 1,
    },
  };

  const [items, total] = await Promise.all([
    Program.find(filters)
      .sort(sortMap[sortBy])
      .skip((pageNumber - 1) * pageSize)
      .limit(pageSize)
      .lean(),
    Program.countDocuments(filters),
  ]);

  res.status(200).json({
    success: true,
    data: items,
    meta: {
      page: pageNumber,
      limit: pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    },
  });
});

module.exports = {
  listPrograms,
};
