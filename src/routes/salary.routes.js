import { Router } from "express";
import {
    createOrUpdateSalary,
    getSalary,
    getMySalary,
    getMyPayslip
} from "../controllers/salary/salary.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { roleGuard } from "../middlewares/role.middleware.js";

const salaryRouter = Router();

salaryRouter.route("/")
    .post(verifyJWT, roleGuard("ADMIN", "HR"), createOrUpdateSalary);

salaryRouter.route("/employee/:id")
    .get(verifyJWT, roleGuard("ADMIN", "HR"), getSalary);

salaryRouter.route("/my")
    .get(verifyJWT, getMySalary);

salaryRouter.route("/payslip/my")
    .get(verifyJWT, getMyPayslip);

export default salaryRouter;
