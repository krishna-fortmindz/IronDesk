import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import Company from "../../models/company/company.model.js";
import Employee from "../../models/employee/employee.model.js";
import mongoose from "mongoose";

const createCompany = asyncHandler(async (req, res) => {
    const { name, address, email, phone, website, logo } = req.body;

    if (!name || !address || !email) {
        throw new ApiError(400, "Name, address, and email are required");
    }

    const existing = await Company.findOne({ name });
    if (existing) {
        throw new ApiError(409, "A company with this name already exists");
    }

    const company = await Company.create({ name, address, email, phone, website, logo });

    return res.status(201).json(
        new ApiResponse(201, company, "Company created successfully")
    );
});

const getAllCompanies = asyncHandler(async (req, res) => {
    const companies = await Company.find().sort({ createdAt: -1 });
    return res.status(200).json(
        new ApiResponse(200, companies, "Companies fetched successfully")
    );
});

const getCompanyDetails = asyncHandler(async (req, res) => {
    const user = req.user;
    let companyId;

    const employee = await Employee.findOne({ employeeId: user._id });

    if (employee) {
        companyId = employee.company;
    } else if (user.company) {
        companyId = user.company._id || user.company;
    } else {
        throw new ApiError(404, "Company information not found. You must be an employee or linked to a company.");
    }

    const company = await Company.findById(companyId);

    if (!company) {
        throw new ApiError(404, "Company not found");
    }

    return res.status(200).json(
        new ApiResponse(200, company, "Company details fetched successfully")
    );
});

const updateCompany = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(400, "Invalid company ID");
    }

    const company = await Company.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });

    if (!company) {
        throw new ApiError(404, "Company not found");
    }

    return res.status(200).json(
        new ApiResponse(200, company, "Company updated successfully")
    );
});

export {
    createCompany,
    getAllCompanies,
    getCompanyDetails,
    updateCompany
};
