import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import Salary from "../../models/salary/salary.model.js";
import Employee from "../../models/employee/employee.model.js";
import LeaveApplication from "../../models/leave/leaveApplication.model.js";
import mongoose from "mongoose";


const createOrUpdateSalary = asyncHandler(async (req, res) => {
    const { employeeId, baseSalary, allowances, deductions, effectiveFrom } = req.body;

    if (!employeeId || !baseSalary) {
        throw new ApiError(400, "Employee ID and Base Salary are required");
    }

    let employee = await Employee.findOne({ employeeId: employeeId });
    if (!employee && mongoose.Types.ObjectId.isValid(employeeId)) {
        employee = await Employee.findById(employeeId);
    }

    if (!employee) {
        throw new ApiError(404, "Employee not found with the provided ID (checked both User ID and Employee Document ID)");
    }

    const targetEmployeeId = employee._id;

    let salary = await Salary.findOne({ employeeId: targetEmployeeId });

    if (salary) {
        salary.baseSalary = baseSalary;
        salary.allowances = allowances || salary.allowances;
        salary.deductions = deductions || salary.deductions;
        salary.effectiveFrom = effectiveFrom || salary.effectiveFrom;
        await salary.save();
    } else {
        salary = await Salary.create({
            employeeId: targetEmployeeId,
            baseSalary,
            allowances,
            deductions,
            effectiveFrom
        });
    }

    return res.status(200).json(
        new ApiResponse(200, salary, "Salary structure saved successfully")
    );
});

const getSalary = asyncHandler(async (req, res) => {
    const { id } = req.params;


    let employee = await Employee.findOne({ employeeId: id });
    if (!employee && mongoose.Types.ObjectId.isValid(id)) {
        employee = await Employee.findById(id);
    }

    if (!employee) {
        throw new ApiError(404, "Employee record not found for the provided ID");
    }

    const salary = await Salary.findOne({ employeeId: employee._id });

    if (!salary) {
        throw new ApiError(404, "Salary structure not found for this employee");
    }

    if (!salary) {
        throw new ApiError(404, "Salary structure not found for this employee");
    }

    return res.status(200).json(
        new ApiResponse(200, salary, "Salary structure fetched successfully")
    );
});

const getMySalary = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const employee = await Employee.findOne({ employeeId: userId });

    if (!employee) {
        throw new ApiError(404, "Employee record not found");
    }

    const salary = await Salary.findOne({ employeeId: employee._id });

    if (!salary) {
        throw new ApiError(404, "Salary structure not found");
    }

    return res.status(200).json(
        new ApiResponse(200, salary, "My salary structure fetched successfully")
    );
});



const getMyPayslip = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const employee = await Employee.findOne({ employeeId: userId });
    console.log("DEBUG: getMyPayslip called by User ID:", userId);

    if (!employee) {
        console.log("DEBUG: No Employee record found for User ID:", userId);
        throw new ApiError(404, "Employee record not found for the logged-in user. Please ensure you have created an Employee profile.");
    }

    const salary = await Salary.findOne({ employeeId: employee._id });

    if (!salary) {
        throw new ApiError(404, "Salary structure not found");
    }

    const date = new Date();
    const month = req.query.month ? parseInt(req.query.month) - 1 : date.getMonth(); // 0-indexed
    const year = req.query.year ? parseInt(req.query.year) : date.getFullYear();

    const startOfMonth = new Date(year, month, 1);
    const endOfMonth = new Date(year, month + 1, 0);

    const approvedLeaves = await LeaveApplication.find({
        employeeId: employee._id,
        status: "APPROVED",
        startDate: { $lte: endOfMonth },
        endDate: { $gte: startOfMonth }
    });

    let totalLeaveDays = 0;
    approvedLeaves.forEach(leave => {
        const start = leave.startDate < startOfMonth ? startOfMonth : leave.startDate;
        const end = leave.endDate > endOfMonth ? endOfMonth : leave.endDate;
        const diff = end - start;
        const days = Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1;
        totalLeaveDays += days;
    });

    const payslip = {
        employee: {
            name: req.user.name,
            email: req.user.email,
            designation: employee.designation,
            department: employee.department
        },
        period: {
            month: month + 1,
            year: year
        },
        salaryStructure: {
            baseSalary: salary.baseSalary,
            allowances: salary.allowances,
            deductions: salary.deductions
        },
        attendance: {
            totalLeaveDays: totalLeaveDays
        },
    };

    return res.status(200).json(
        new ApiResponse(200, payslip, "Payslip generated successfully")
    );
});

export { createOrUpdateSalary, getSalary, getMySalary, getMyPayslip };
