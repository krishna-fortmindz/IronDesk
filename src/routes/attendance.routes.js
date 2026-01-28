import { Router } from "express";
import {
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
} from "../controllers/attendance/attendance.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { roleGuard } from "../middlewares/role.middleware.js";

const attendanceRouter = Router();

attendanceRouter.route("/locations")
    .patch(verifyJWT, roleGuard("ADMIN", "HR"), addWorkLocation)
    .get(verifyJWT, roleGuard("ADMIN", "HR"), getWorkLocations);

attendanceRouter.route("/check-in")
    .post(verifyJWT, checkIn);

attendanceRouter.route("/check-out")
    .post(verifyJWT, checkOut);

attendanceRouter.route("/my")
    .get(verifyJWT, getMyAttendance);

attendanceRouter.route("/all")
    .get(verifyJWT, roleGuard("ADMIN", "HR"), getAllCompanyAttendance);

attendanceRouter.route("/employee/:id")
    .get(verifyJWT, roleGuard("ADMIN", "HR"), getEmployeeAttendance);

attendanceRouter.route("/request")
    .post(verifyJWT, requestAttendance);

attendanceRouter.route("/approve")
    .post(verifyJWT, roleGuard("ADMIN", "HR"), handleAttendanceRequest);

attendanceRouter.route("/update")
    .patch(verifyJWT, roleGuard("ADMIN", "HR"), updateAttendance);

export default attendanceRouter;
