import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import Breakdown from "../../models/breakdown/breakdown.model.js";
import mongoose from "mongoose";

function generateSummary(equipmentName, rawDescription) {
    const lower = rawDescription.toLowerCase();
    let severity = "MEDIUM";

    if (/critical|fire|explosion|smoke|emergency|danger/.test(lower)) {
        severity = "CRITICAL";
    } else if (/not working|broken|failed|failure|stopped|down/.test(lower)) {
        severity = "HIGH";
    } else if (/slow|noise|vibrat|leak|warn/.test(lower)) {
        severity = "LOW";
    }

    const summary = `Equipment "${equipmentName}" reported as broken. Issue: ${rawDescription.slice(0, 120)}${rawDescription.length > 120 ? "..." : ""}. Detected severity: ${severity}.`;
    return { summary, severity };
}

const reportBreakdown = asyncHandler(async (req, res) => {
    const { equipmentName, rawDescription } = req.body;

    if (!equipmentName || !rawDescription) {
        throw new ApiError(400, "Equipment name and description are required");
    }

    const { summary, severity } = generateSummary(equipmentName, rawDescription);

    const breakdown = await Breakdown.create({
        reportedBy: req.user._id,
        equipmentName,
        rawDescription,
        generatedSummary: summary,
        severity
    });

    return res.status(201).json(
        new ApiResponse(201, breakdown, "Breakdown reported successfully")
    );
});

const getAllBreakdowns = asyncHandler(async (req, res) => {
    const { status, severity } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (severity) filter.severity = severity;

    const breakdowns = await Breakdown.find(filter)
        .populate("reportedBy", "name email")
        .populate("assignedTo", "name email")
        .sort({ createdAt: -1 });

    return res.status(200).json(
        new ApiResponse(200, breakdowns, "Breakdowns fetched successfully")
    );
});

const getMyBreakdowns = asyncHandler(async (req, res) => {
    const breakdowns = await Breakdown.find({ reportedBy: req.user._id })
        .populate("assignedTo", "name email")
        .sort({ createdAt: -1 });

    return res.status(200).json(
        new ApiResponse(200, breakdowns, "My breakdown reports fetched successfully")
    );
});

const getBreakdownById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(400, "Invalid breakdown ID");
    }

    const breakdown = await Breakdown.findById(id)
        .populate("reportedBy", "name email")
        .populate("assignedTo", "name email");

    if (!breakdown) {
        throw new ApiError(404, "Breakdown report not found");
    }

    return res.status(200).json(
        new ApiResponse(200, breakdown, "Breakdown report fetched successfully")
    );
});

const updateBreakdownStatus = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { status, assignedTo } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(400, "Invalid breakdown ID");
    }

    const allowed = ["REPORTED", "IN_PROGRESS", "RESOLVED", "CLOSED"];
    if (status && !allowed.includes(status)) {
        throw new ApiError(400, `Invalid status. Allowed: ${allowed.join(", ")}`);
    }

    const update = {};
    if (status) update.status = status;
    if (assignedTo) update.assignedTo = assignedTo;
    if (status === "RESOLVED" || status === "CLOSED") update.resolvedAt = new Date();

    const breakdown = await Breakdown.findByIdAndUpdate(id, update, { new: true })
        .populate("reportedBy", "name email")
        .populate("assignedTo", "name email");

    if (!breakdown) {
        throw new ApiError(404, "Breakdown report not found");
    }

    return res.status(200).json(
        new ApiResponse(200, breakdown, "Breakdown status updated successfully")
    );
});

export {
    reportBreakdown,
    getAllBreakdowns,
    getMyBreakdowns,
    getBreakdownById,
    updateBreakdownStatus
};