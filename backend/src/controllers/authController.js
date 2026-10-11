
const jwt = require("jsonwebtoken");
const Student = require("../models/Student");
const env = require("../config/env");
const asyncHandler = require("../utils/asyncHandler");
const HttpError = require("../utils/httpError");

const createToken = (student) =>
  jwt.sign(
    {
      sub: student._id.toString(),
      role: student.role,
    },
    env.jwtSecret,
    { expiresIn: env.jwtExpiresIn }
  );

const register = asyncHandler(async (req, res) => {
  const { fullName, email, password } = req.body;

  if (
    typeof fullName !== "string" ||
    !fullName.trim() ||
    typeof email !== "string" ||
    !email.trim() ||
    typeof password !== "string" ||
    password.length < 8
  ) {
    throw new HttpError(
      400,
      "Full name, email and password of at least 8 characters are required."
    );
  }

  const normalizedEmail = email.trim().toLowerCase();

  const existingUser = await Student.findOne({
    email: normalizedEmail,
  });

  if (existingUser) {
    throw new HttpError(409, "Email is already registered.");
  }

  const student = await Student.create({
    fullName: fullName.trim(),
    email: normalizedEmail,
    password,
    role: "student",
  });

  res.status(201).json({
    success: true,
    message: "Registration successful.",
    token: createToken(student),
    user: {
      id: student._id,
      fullName: student.fullName,
      email: student.email,
      role: student.role,
    },
  });
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (
    typeof email !== "string" ||
    !email.trim() ||
    typeof password !== "string" ||
    !password
  ) {
    throw new HttpError(400, "Email and password are required.");
  }

  const student = await Student.findOne({
    email: email.trim().toLowerCase(),
  });

  if (!student || !(await student.comparePassword(password))) {
    throw new HttpError(401, "Invalid email or password.");
  }

  res.status(200).json({
    success: true,
    message: "Login successful.",
    token: createToken(student),
    user: {
      id: student._id,
      fullName: student.fullName,
      email: student.email,
      role: student.role,
    },
  });
});

const me = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    user: {
      id: req.user._id,
      fullName: req.user.fullName,
      email: req.user.email,
      role: req.user.role,
      targetCountries: req.user.targetCountries,
      interestedFields: req.user.interestedFields,
      preferredIntake: req.user.preferredIntake,
      maxBudgetUsd: req.user.maxBudgetUsd,
      englishTest: req.user.englishTest,
      profileComplete: req.user.profileComplete,
    },
  });
});

module.exports = { register, login, me };
