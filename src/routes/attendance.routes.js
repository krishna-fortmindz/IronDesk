import { Router } from "express";
import {
    addWorkLocation,
    getWorkLocations,
    checkIn,
    checkOut,
    getMyAttendance,
    getEmployeeAttendance
} from "../controllers/attendance/attendance.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { roleGuard } from "../middlewares/role.middleware.js";

const attendanceRouter = Router();

attendanceRouter.route("/locations")
    .post(verifyJWT, roleGuard("ADMIN", "HR"), addWorkLocation)
    .get(verifyJWT, roleGuard("ADMIN", "HR"), getWorkLocations);

attendanceRouter.route("/check-in")
    .post(verifyJWT, checkIn);

attendanceRouter.route("/check-out")
    .post(verifyJWT, checkOut);

attendanceRouter.route("/my")
    .get(verifyJWT, getMyAttendance);

attendanceRouter.route("/employee/:id")
    .get(verifyJWT, roleGuard("ADMIN", "HR"), getEmployeeAttendance);

export default attendanceRouter;
