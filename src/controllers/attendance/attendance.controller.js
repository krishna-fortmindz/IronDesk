import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import WorkLocation from "../../models/attendance/workLocation.model.js";
import Attendance from "../../models/attendance/attendance.model.js";
import Employee from "../../models/employee/employee.model.js";
import moment from "moment";
import mongoose from "mongoose";

function getDistanceFromLatLonInMeters(lat1, lon1, lat2, lon2) {
    const R = 6371e3;
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c;
    return d;
}

function deg2rad(deg) {
    return deg * (Math.PI / 180);
}

const addWorkLocation = asyncHandler(async (req, res) => {
    const { name, latitude, longitude, radiusInMeters } = req.body;

    if (!name || latitude === undefined || longitude === undefined) {
        throw new ApiError(400, "Name, latitude, and longitude are required");
    }

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

    const location = await WorkLocation.findOneAndUpdate(
        { name, company: companyId },
        {
            name,
            latitude,
            longitude,
            radiusInMeters: radiusInMeters || 100,
            company: companyId,
            isActive: true
        },
        { new: true, upsert: true }
    );

    return res.status(201).json(
        new ApiResponse(201, location, "Work location added successfully")
    );
});

const getWorkLocations = asyncHandler(async (req, res) => {
    const user = req.user;
    let companyId;

    const employee = await Employee.findOne({ employeeId: user._id });

    if (employee) {
        companyId = employee.company;
    } else if (user.company) {
        companyId = user.company._id || user.company;
    } else {
        throw new ApiError(404, "Company information not found.");
    }

    const locations = await WorkLocation.find({ isActive: true, company: companyId });
    return res.status(200).json(
        new ApiResponse(200, locations, "Work locations fetched successfully")
    );
});

const checkIn = asyncHandler(async (req, res) => {
    const { latitude, longitude, biometricVerified } = req.body;
    const userId = req.user._id;

    const employee = await Employee.findOne({ employeeId: userId });
    if (!employee) {
        throw new ApiError(403, "Only employees can check in");
    }

    if (!biometricVerified) {
        throw new ApiError(403, "Biometric verification failed");
    }
    const activeLocations = await WorkLocation.find({ isActive: true, company: employee.company });
    let isInside = false;

    for (const loc of activeLocations) {
        const distance = getDistanceFromLatLonInMeters(latitude, longitude, loc.latitude, loc.longitude);
        if (distance <= loc.radiusInMeters) {
            isInside = true;
            break;
        }
    }

    if (!isInside) {
        throw new ApiError(403, "Check-in denied: You are outside the office location");
    }

    const today = moment().format("YYYY-MM-DD");
    const existingAttendance = await Attendance.findOne({ employeeId: employee._id, date: today });

    if (existingAttendance) {
        throw new ApiError(400, "You have already checked in today");
    }

    const checkInTime = new Date();
    const lateThreshold = moment().set({ hour: 9, minute: 30, second: 0 });
    const status = moment(checkInTime).isAfter(lateThreshold) ? "LATE" : "PRESENT";

    const attendance = await Attendance.create({
        employeeId: employee._id,
        date: today,
        checkInTime,
        checkInLocation: { lat: latitude, lng: longitude },
        status,
        isVerified: true,
        verificationStatus: "APPROVED"
    });

    return res.status(200).json(
        new ApiResponse(200, attendance, `Checked in successfully. Status: ${status}`)
    );
});

const checkOut = asyncHandler(async (req, res) => {
    const { latitude, longitude } = req.body;
    const userId = req.user._id;
    const employee = await Employee.findOne({ employeeId: userId });

    if (!employee) {
        throw new ApiError(403, "Employee record not found");
    }

    const today = moment().format("YYYY-MM-DD");
    const attendance = await Attendance.findOne({ employeeId: employee._id, date: today });

    if (!attendance) {
        throw new ApiError(400, "No check-in record found for today");
    }

    if (attendance.checkOutTime) {
        throw new ApiError(400, "You have already checked out today");
    }

    attendance.checkOutTime = new Date();
    attendance.checkOutLocation = { lat: latitude, lng: longitude };
    await attendance.save();

    return res.status(200).json(
        new ApiResponse(200, attendance, "Checked out successfully")
    );
});

// --- History ---

const getMyAttendance = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const employee = await Employee.findOne({ employeeId: userId });

    if (!employee) {
        throw new ApiError(404, "Employee record not found");
    }

    const history = await Attendance.find({ employeeId: employee._id })
        .sort({ date: -1 })
        .limit(30);

    return res.status(200).json(
        new ApiResponse(200, history, "Attendance history fetched successfully")
    );
});

const getEmployeeAttendance = asyncHandler(async (req, res) => {
    const { id } = req.params;

    let employee = await Employee.findOne({ employeeId: id });
    if (!employee && mongoose.Types.ObjectId.isValid(id)) {
        employee = await Employee.findById(id);
    }

    if (!employee) {
        throw new ApiError(404, "Employee not found");
    }

    const history = await Attendance.find({ employeeId: employee._id })
        .sort({ date: -1 })
        .limit(30);

    return res.status(200).json(
        new ApiResponse(200, history, "Employee attendance fetched successfully")
    );
});

const getAllCompanyAttendance = asyncHandler(async (req, res) => {
    const user = req.user;
    let companyId;

    const employee = await Employee.findOne({ employeeId: user._id });

    if (employee) {
        console.log("Logged-in Employee:", employee);
        companyId = employee.company;
    } else if (user.company) {
        console.log("Logged-in User Company (Fallback):", user.company);
        companyId = user.company._id || user.company; // Handle populated or unpopulated
    } else {
        throw new ApiError(404, "Company information not found for the requesting user");
    }

    console.log("HR/Admin Company ID (Raw):", companyId);
    console.log("HR/Admin Company ID (Type):", typeof companyId);

    // Find all employees in the same company
    const companyEmployees = await Employee.find({ company: companyId }).select("_id");
    console.log("Found Company Employees Count:", companyEmployees.length);

    // Debug: Try finding ALL employees to see their structure
    if (companyEmployees.length === 0) {
        const allEmps = await Employee.find({});
        console.log("Total Employees in DB:", allEmps.length);
        if (allEmps.length > 0) {
            console.log("Sample Employee Company:", allEmps[0].company);
        }
    }

    const employeeIds = companyEmployees.map(emp => emp._id);
    console.log("Employee IDs:", employeeIds);

    const attendanceRecords = await Attendance.find({ employeeId: { $in: employeeIds } })
        .sort({ date: -1 })
        .populate({
            path: "employeeId",
            select: "designation department employeeId", // employeeId field in Employee model refers to User
            populate: {
                path: "employeeId", // Nested populate to get User details (name, email)
                select: "name email avatar"
            }
        });

    return res.status(200).json(
        new ApiResponse(200, attendanceRecords, "All company attendance fetched successfully")
    );
});



const requestAttendance = asyncHandler(async (req, res) => {
    const { date, checkInTime, checkOutTime, reason } = req.body;
    const userId = req.user._id;

    const employee = await Employee.findOne({ employeeId: userId });
    if (!employee) {
        throw new ApiError(404, "Employee record not found");
    }

    const requestedDate = date || moment().format("YYYY-MM-DD");

    const existingAttendance = await Attendance.findOne({
        employeeId: employee._id,
        date: requestedDate
    });

    if (existingAttendance) {
        if (existingAttendance.verificationStatus === "PENDING") {
            throw new ApiError(400, "A pending request for this date already exists.");
        }
        if (existingAttendance.verificationStatus === "APPROVED") {
            throw new ApiError(400, "Attendance for this date is already verified.");
        }
    }

    const cInTime = checkInTime ? new Date(checkInTime) : new Date();

    const threshold = moment(requestedDate, "YYYY-MM-DD").set({ hour: 9, minute: 30, second: 0 });
    const checkInMoment = moment(cInTime);
    const status = checkInMoment.isAfter(threshold) ? "LATE" : "PRESENT";

    const newAttendance = await Attendance.create({
        employeeId: employee._id,
        date: requestedDate,
        checkInTime: cInTime,
        checkOutTime: checkOutTime ? new Date(checkOutTime) : null,
        status,
        method: "WEB",
        isVerified: false,
        verificationStatus: "PENDING"
    });

    return res.status(201).json(
        new ApiResponse(201, newAttendance, "Attendance request submitted for approval")
    );
});

const handleAttendanceRequest = asyncHandler(async (req, res) => {
    const { attendanceId, action } = req.body;

    if (!["APPROVE", "REJECT"].includes(action)) {
        throw new ApiError(400, "Invalid action. Use APPROVE or REJECT");
    }

    const attendance = await Attendance.findById(attendanceId);
    if (!attendance) {
        throw new ApiError(404, "Attendance record not found");
    }

    if (action === "APPROVE") {
        attendance.isVerified = true;
        attendance.verificationStatus = "APPROVED";
    } else {
        attendance.isVerified = false;
        attendance.verificationStatus = "REJECTED";
    }

    await attendance.save();

    return res.status(200).json(
        new ApiResponse(200, attendance, `Attendance request ${action === "APPROVE" ? "approved" : "rejected"}`)
    );
});

const updateAttendance = asyncHandler(async (req, res) => {
    const { attendanceId, date, checkInTime, checkOutTime, status } = req.body;

    const attendance = await Attendance.findById(attendanceId);
    if (!attendance) {
        throw new ApiError(404, "Attendance record not found");
    }

    if (date) attendance.date = date;
    if (checkInTime) attendance.checkInTime = new Date(checkInTime);
    if (checkOutTime) attendance.checkOutTime = new Date(checkOutTime);
    if (status) attendance.status = status;

    attendance.isVerified = true;
    attendance.verificationStatus = "APPROVED";

    await attendance.save();

    return res.status(200).json(
        new ApiResponse(200, attendance, "Attendance updated successfully")
    );
});

export {
    addWorkLocation,
    getWorkLocations,
    checkIn,
    checkOut,
    getMyAttendance,
    getEmployeeAttendance,
    getAllCompanyAttendance,
    requestAttendance,
    handleAttendanceRequest,
    updateAttendance
};
