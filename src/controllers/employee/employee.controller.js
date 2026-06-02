import Employee from "../../models/employee/employee.model.js";
import User from "../../models/users/user.model.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { ApiError } from "../../utils/ApiError.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import mongoose from "mongoose";

export const getAllEmployee = asyncHandler(async (req, res) => {
    const employees = await Employee.find().populate("employeeId", "-password -refreshToken");
    res.status(200).json(
        new ApiResponse(200, employees, "Employees fetched successfully")
    );
});

export const getEmployeeById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    let employee;
    if (mongoose.Types.ObjectId.isValid(id)) {
        employee = await Employee.findById(id).populate("employeeId", "-password -refreshToken");
        if (!employee) {
            employee = await Employee.findOne({ employeeId: id }).populate("employeeId", "-password -refreshToken");
        }
    }

    if (!employee) {
        throw new ApiError(404, "Employee not found");
    }

    res.status(200).json(
        new ApiResponse(200, employee, "Employee fetched successfully")
    );
});

export const updateEmployee = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(400, "Invalid employee ID");
    }

    const employee = await Employee.findByIdAndUpdate(id, req.body, { new: true });

    if (!employee) {
        throw new ApiError(404, "Employee not found");
    }

    res.status(200).json(
        new ApiResponse(200, employee, "Employee updated successfully")
    );
});

export const deactivateEmployee = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(400, "Invalid employee ID");
    }

    const employee = await Employee.findById(id);
    if (!employee) {
        throw new ApiError(404, "Employee not found");
    }

    const user = await User.findByIdAndUpdate(
        employee.employeeId,
        { isActive: false },
        { new: true }
    ).select("-password -refreshToken");

    return res.status(200).json(
        new ApiResponse(200, { employee, user }, "Employee deactivated successfully")
    );
});

export const activateEmployee = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(400, "Invalid employee ID");
    }

    const employee = await Employee.findById(id);
    if (!employee) {
        throw new ApiError(404, "Employee not found");
    }

    const user = await User.findByIdAndUpdate(
        employee.employeeId,
        { isActive: true },
        { new: true }
    ).select("-password -refreshToken");

    return res.status(200).json(
        new ApiResponse(200, { employee, user }, "Employee activated successfully")
    );
});
