import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import Company from "../../models/company/company.model.js";
import Employee from "../../models/employee/employee.model.js";

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

export {
    getCompanyDetails
};
