import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import WorkLocation from "../../models/attendance/workLocation.model.js";
import Attendance from "../../models/attendance/attendance.model.js";
import Employee from "../../models/employee/employee.model.js";
import moment from "moment";
import mongoose from "mongoose";

function getDistanceFromLatLonInMiters(lat1, lon1, lat2, lon2) {
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

    const location = await WorkLocation.create({
        name,
        latitude,
        longitude,
        radiusInMeters: radiusInMeters || 100
    });

    return res.status(201).json(
        new ApiResponse(201, location, "Work location added successfully")
    );
});

const getWorkLocations = asyncHandler(async (req, res) => {
    const locations = await WorkLocation.find({ isActive: true });
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
    const activeLocations = await WorkLocation.find({ isActive: true });
    let isInside = false;

    for (const loc of activeLocations) {
        const distance = getDistanceFromLatLonInMiters(latitude, longitude, loc.latitude, loc.longitude);
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
        status
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


export {
    addWorkLocation,
    getWorkLocations,
    checkIn,
    checkOut,
    getMyAttendance,
    getEmployeeAttendance
};
