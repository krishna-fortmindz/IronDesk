import User from "../../models/users/user.model.js";
import jwt from "jsonwebtoken";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import Employee from "../../models/employee/employee.model.js";
import "../../models/company/company.model.js";
import mongoose from "mongoose";

const generateAccessAndRefreshTokens = async (userId) => {
    try {
        const user = await User.findById(userId);

        if (!user) {
            throw new ApiError(404, "User not found while generating tokens");
        }

        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };

    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating referesh and access token");
    }
}

const registerUser = asyncHandler(async (req, res) => {
    const { name, email, password, role } = req.body;

    if ([name, email, password, role].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "All fields are required");
    }

    const existedUser = await User.findOne({ email });

    if (existedUser) {
        throw new ApiError(409, "User with email already exists");
    }

    const user = await User.create({
        name,
        email,
        password,
    });

    const createdUser = await User.findById(user._id).select("-password -refreshToken");

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user");
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered Successfully")
    );
});

const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email) {
        throw new ApiError(400, "username or email is required");
    }

    const user = await User.findOne({ email });

    if (!user) {
        throw new ApiError(404, "User does not exist");
    }

    const isPasswordValid = await user.isPasswordCorrect(password);

    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid user credentials");
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);

    const loggedInUser = await User.findById(user._id).populate("company").select("-password -refreshToken");

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
        .status(200)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                {
                    user: loggedInUser,
                    accessToken,
                    refreshToken
                },
                "User logged In Successfully"
            )
        );
});

const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;

    if (!incomingRefreshToken) {
        throw new ApiError(401, "unauthorized request");
    }

    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        );

        const user = await User.findById(decodedToken?._id);

        if (!user) {
            throw new ApiError(401, "Invalid refresh token");
        }

        if (incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, "Refresh token is expired or used");
        }

        const options = {
            httpOnly: true,
            secure: true
        }

        const { accessToken, refreshToken: newRefreshToken } = await generateAccessAndRefreshTokens(user._id);

        return res
            .status(200)
            .cookie("refreshToken", newRefreshToken, options)
            .json(
                new ApiResponse(
                    200,
                    { accessToken, refreshToken: newRefreshToken },
                    "Access token refreshed"
                )
            );

    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid refresh token");
    }
});
const createEmployeeFromUser = asyncHandler(async (req, res) => {
    const { employeeId, department, designation, shift, role } = req.body;

    const user = await User.findById(employeeId);
    if (!user) {
        throw new ApiError(404, "User not found");
    }

    if (user.role !== "USER") {
        throw new ApiError(400, "User is already converted");
    }

    const existingEmployee = await Employee.findOne({ employeeId });
    if (existingEmployee) {
        throw new ApiError(409, "Employee already exists");
    }

    const imageUrl = req.file?.location;

    // Ensure user has a company before creating employee
    if (!user.company) {
        throw new ApiError(400, "User must belong to a company to become an employee");
    }

    const employee = await Employee.create({
        employeeId,
        department,
        designation,
        shift,
        imageUrl,
        company: user.company // Assign the user's company to the employee
    });
    user.role = role || "EMPLOYEE";
    user.employee = employee._id;
    await user.save();

    return res.status(201).json(
        new ApiResponse(201, employee, "Employee created and user approved")
    );
});

const getUserById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(400, "Invalid MongoDB user id");
    }

    const user = await User.findById(id).populate("company");
    if (!user) {
        throw new ApiError(404, "User not found");
    }
    return res.status(200).json(
        new ApiResponse(200, user, "User fetched successfully")
    );
});
const getAllUsers = asyncHandler(async (req, res) => {
    const users = await User.find({
        role: "USER",
        isActive: true
    }).populate("company").select("-password -refreshToken");

    return res.status(200).json(
        new ApiResponse(200, users, "Pending users fetched successfully")
    );
});


const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        { $unset: { refreshToken: 1 } },
        { new: true }
    );

    const options = { httpOnly: true, secure: true };

    return res
        .status(200)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "User logged out successfully"));
});

const assignUserToCompany = asyncHandler(async (req, res) => {
    const { userId, companyId } = req.body;

    if (!userId || !companyId) {
        throw new ApiError(400, "userId and companyId are required");
    }

    if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(companyId)) {
        throw new ApiError(400, "Invalid userId or companyId");
    }

    const user = await User.findByIdAndUpdate(
        userId,
        { company: companyId },
        { new: true }
    ).populate("company").select("-password -refreshToken");

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    return res.status(200).json(
        new ApiResponse(200, user, "User assigned to company successfully")
    );
});

export { registerUser, loginUser, refreshAccessToken, createEmployeeFromUser, getAllUsers, getUserById, logoutUser, assignUserToCompany };
