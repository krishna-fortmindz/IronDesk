import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import LeavePolicy from "../../models/leave/leavePolicy.model.js";
import LeaveApplication from "../../models/leave/leaveApplication.model.js";
import Employee from "../../models/employee/employee.model.js";
import mongoose from "mongoose";


const createPolicy = asyncHandler(async (req, res) => {
    const { name, maxDaysPerYear, carryForward, requiresApproval, applicableRoles } = req.body;

    if (!name || maxDaysPerYear === undefined) {
        throw new ApiError(400, "Name and maxDaysPerYear are required");
    }

    const policy = await LeavePolicy.create({
        name,
        maxDaysPerYear,
        carryForward,
        requiresApproval,
        applicableRoles
    });

    return res.status(201).json(
        new ApiResponse(201, policy, "Leave Policy created successfully")
    );
});

const getAllPolicies = asyncHandler(async (req, res) => {
    const policies = await LeavePolicy.find();
    return res.status(200).json(
        new ApiResponse(200, policies, "Leave Policies fetched successfully")
    );
});

const updatePolicy = asyncHandler(async (req, res) => {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(400, "Invalid policy ID");
    }

    const policy = await LeavePolicy.findByIdAndUpdate(id, req.body, { new: true });

    if (!policy) {
        throw new ApiError(404, "Leave Policy not found");
    }

    return res.status(200).json(
        new ApiResponse(200, policy, "Leave Policy updated successfully")
    );
});


const applyLeave = asyncHandler(async (req, res) => {
    const { leavePolicyId, startDate, endDate, reason } = req.body;
    const userId = req.user._id;

    const employee = await Employee.findOne({ employeeId: userId }); // Assuming employeeId in Employee model refers to User ID
    if (!employee) {
        throw new ApiError(403, "Only employees can apply for leave");
    }

    const policy = await LeavePolicy.findById(leavePolicyId);
    if (!policy) {
        throw new ApiError(404, "Leave Policy not found");
    }


    const start = new Date(startDate);
    const end = new Date(endDate);
    const timeDiff = end - start;
    const daysCount = Math.ceil(timeDiff / (1000 * 60 * 60 * 24)) + 1; 

    if (daysCount <= 0) {
        throw new ApiError(400, "End date must be after start date");
    }

    const currentYear = new Date().getFullYear();
    const startOfYear = new Date(currentYear, 0, 1);
    const endOfYear = new Date(currentYear, 11, 31);

    const usedLeaves = await LeaveApplication.aggregate([
        {
            $match: {
                employeeId: employee._id,
                leavePolicyId: new mongoose.Types.ObjectId(leavePolicyId),
                status: "APPROVED",
                startDate: { $gte: startOfYear, $lte: endOfYear }
            }
        },
        {
            $group: {
                _id: null,
                totalDays: { $sum: "$daysCount" }
            }
        }
    ]);

    const usedDays = usedLeaves.length > 0 ? usedLeaves[0].totalDays : 0;
    const remainingBalance = policy.maxDaysPerYear - usedDays;

    if (daysCount > remainingBalance) {
        throw new ApiError(400, `Insufficient leave balance. Remaining: ${remainingBalance}, Requested: ${daysCount}`);
    }

    const application = await LeaveApplication.create({
        employeeId: employee._id,
        leavePolicyId,
        startDate,
        endDate,
        daysCount,
        reason,
        status: "PENDING"
    });

    return res.status(201).json(
        new ApiResponse(201, application, "Leave application submitted successfully")
    );
});


const getPendingLeaves = asyncHandler(async (req, res) => {
    const pendingLeaves = await LeaveApplication.find({ status: "PENDING" })
        .populate("employeeId", "designation department") 
        .populate({
            path: "employeeId",
            populate: { path: "employeeId", select: "name email" }
        })
        .populate("leavePolicyId", "name");

    return res.status(200).json(
        new ApiResponse(200, pendingLeaves, "Pending leaves fetched successfully")
    );
});

const approveLeave = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const leave = await LeaveApplication.findById(id);
    if (!leave) {
        throw new ApiError(404, "Leave application not found");
    }

    if (leave.status !== "PENDING") {
        throw new ApiError(400, `Leave application is already ${leave.status}`);
    }

    leave.status = "APPROVED";
    leave.approvedBy = req.user._id;
    await leave.save();

    return res.status(200).json(
        new ApiResponse(200, leave, "Leave approved successfully")
    );
});

const rejectLeave = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const leave = await LeaveApplication.findById(id);
    if (!leave) {
        throw new ApiError(404, "Leave application not found");
    }

    if (leave.status !== "PENDING") {
        throw new ApiError(400, `Leave application is already ${leave.status}`);
    }

    leave.status = "REJECTED";
    leave.approvedBy = req.user._id;
    await leave.save();

    return res.status(200).json(
        new ApiResponse(200, leave, "Leave rejected successfully")
    );
});

const getMyLeaves = asyncHandler(async (req, res) => {
    // Find employee record for current user
    const employee = await Employee.findOne({ employeeId: req.user._id });
    if (!employee) {
        throw new ApiError(404, "Employee record not found");
    }

    const leaves = await LeaveApplication.find({ employeeId: employee._id })
        .populate("leavePolicyId", "name")
        .sort({ createdAt: -1 });

    return res.status(200).json(
        new ApiResponse(200, leaves, "My leave history fetched successfully")
    );
});

export {
    createPolicy,
    getAllPolicies,
    updatePolicy,
    applyLeave,
    getPendingLeaves,
    approveLeave,
    rejectLeave,
    getMyLeaves
};
