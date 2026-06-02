import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import Approval from "../../models/approval/approval.model.js";
import mongoose from "mongoose";

const createApprovalRequest = asyncHandler(async (req, res) => {
    const { type, referenceId, description } = req.body;

    if (!type || !description) {
        throw new ApiError(400, "Type and description are required");
    }

    const approval = await Approval.create({
        requestedBy: req.user._id,
        type,
        referenceId: referenceId || null,
        description
    });

    return res.status(201).json(
        new ApiResponse(201, approval, "Approval request submitted successfully")
    );
});

const getPendingApprovals = asyncHandler(async (req, res) => {
    const approvals = await Approval.find({ status: "PENDING" })
        .populate("requestedBy", "name email role")
        .sort({ createdAt: -1 });

    return res.status(200).json(
        new ApiResponse(200, approvals, "Pending approval requests fetched successfully")
    );
});

const getAllApprovals = asyncHandler(async (req, res) => {
    const { status, type } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (type) filter.type = type;

    const approvals = await Approval.find(filter)
        .populate("requestedBy", "name email role")
        .populate("reviewedBy", "name email")
        .sort({ createdAt: -1 });

    return res.status(200).json(
        new ApiResponse(200, approvals, "Approvals fetched successfully")
    );
});

const approveRequest = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { reviewNote } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(400, "Invalid approval ID");
    }

    const approval = await Approval.findById(id);
    if (!approval) {
        throw new ApiError(404, "Approval request not found");
    }

    if (approval.status !== "PENDING") {
        throw new ApiError(400, `Approval request is already ${approval.status}`);
    }

    approval.status = "APPROVED";
    approval.reviewedBy = req.user._id;
    approval.reviewNote = reviewNote || null;
    approval.reviewedAt = new Date();
    await approval.save();

    return res.status(200).json(
        new ApiResponse(200, approval, "Approval request approved successfully")
    );
});

const rejectRequest = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { reviewNote } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(400, "Invalid approval ID");
    }

    const approval = await Approval.findById(id);
    if (!approval) {
        throw new ApiError(404, "Approval request not found");
    }

    if (approval.status !== "PENDING") {
        throw new ApiError(400, `Approval request is already ${approval.status}`);
    }

    approval.status = "REJECTED";
    approval.reviewedBy = req.user._id;
    approval.reviewNote = reviewNote || null;
    approval.reviewedAt = new Date();
    await approval.save();

    return res.status(200).json(
        new ApiResponse(200, approval, "Approval request rejected successfully")
    );
});

const getMyApprovals = asyncHandler(async (req, res) => {
    const approvals = await Approval.find({ requestedBy: req.user._id })
        .populate("reviewedBy", "name email")
        .sort({ createdAt: -1 });

    return res.status(200).json(
        new ApiResponse(200, approvals, "My approval requests fetched successfully")
    );
});

export {
    createApprovalRequest,
    getPendingApprovals,
    getAllApprovals,
    approveRequest,
    rejectRequest,
    getMyApprovals
};