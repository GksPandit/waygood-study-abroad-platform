
const mongoose = require("mongoose");
const Application = require("../models/Application");
const Program = require("../models/Program");
const Student = require("../models/Student");
const asyncHandler = require("../utils/asyncHandler");
const HttpError = require("../utils/httpError");
const { validStatusTransitions } = require("../config/constants");

const listApplications = asyncHandler(async (req, res) => {
  const { studentId, status } = req.query;
  const filters = {};

  // Students can see only their own applications.
  if (req.user.role === "student") {
    filters.student = req.user._id;
  } else if (studentId) {
    if (!mongoose.Types.ObjectId.isValid(studentId)) {
      throw new HttpError(400, "Invalid student ID.");
    }
    filters.student = studentId;
  }

  if (status) {
    if (!Object.prototype.hasOwnProperty.call(validStatusTransitions, status)) {
      throw new HttpError(400, "Invalid application status.");
    }
    filters.status = status;
  }

  const applications = await Application.find(filters)
    .populate("student", "fullName email role")
    .populate("program", "title degreeLevel tuitionFeeUsd")
    .populate("university", "name country city")
    .sort({ createdAt: -1 })
    .lean();

  res.json({ success: true, data: applications });
});

const createApplication = asyncHandler(async (req, res) => {
  const { programId, intake } = req.body;

  // The student ID must come from the verified JWT, not the request body.
  const studentId = req.user._id;

  if (req.user.role !== "student") {
    throw new HttpError(403, "Only students can submit applications.");
  }

  if (!programId || !intake) {
    throw new HttpError(400, "programId and intake are required.");
  }

  if (!mongoose.Types.ObjectId.isValid(programId)) {
    throw new HttpError(400, "Invalid program ID.");
  }

  const [student, program] = await Promise.all([
    Student.findById(studentId).lean(),
    Program.findById(programId).lean(),
  ]);

  if (!student) {
    throw new HttpError(404, "Student not found.");
  }

  if (!program) {
    throw new HttpError(404, "Program not found.");
  }

  if (!(program.intakes || []).includes(intake)) {
    throw new HttpError(
      400,
      "The selected intake is not available for this program."
    );
  }

  try {
    const application = await Application.create({
      student: studentId,
      program: programId,
      university: program.university,
      destinationCountry: program.country,
      intake,
      status: "submitted",
      timeline: [
        {
          status: "submitted",
          note: "Application submitted.",
        },
      ],
    });

    res.status(201).json({
      success: true,
      message: "Application submitted successfully.",
      data: application,
    });
  } catch (error) {
    if (error.code === 11000) {
      throw new HttpError(
        409,
        "You have already applied to this program for this intake."
      );
    }
    throw error;
  }
});

const updateApplicationStatus = asyncHandler(async (req, res) => {
  if (req.user.role !== "counselor") {
    throw new HttpError(403, "Only counselors can update application status.");
  }

  const { id } = req.params;
  const { status, note } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new HttpError(400, "Invalid application ID.");
  }

  if (
    !status ||
    !Object.prototype.hasOwnProperty.call(validStatusTransitions, status)
  ) {
    throw new HttpError(400, "Invalid application status.");
  }

  const application = await Application.findById(id);

  if (!application) {
    throw new HttpError(404, "Application not found.");
  }

  const allowedNextStatuses = validStatusTransitions[application.status] || [];

  if (!allowedNextStatuses.includes(status)) {
    throw new HttpError(
      400,
      `Cannot change status from '${application.status}' to '${status}'.`
    );
  }

  application.status = status;
  application.timeline.push({
    status,
    note:
      typeof note === "string" && note.trim()
        ? note.trim()
        : `Status changed to ${status}.`,
    changedAt: new Date(),
  });

  await application.save();

  res.json({
    success: true,
    message: "Application status updated successfully.",
    data: application,
  });
});

module.exports = {
  createApplication,
  listApplications,
  updateApplicationStatus,
};
