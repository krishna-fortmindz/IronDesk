import { Router } from "express";
import {
    createOrUpdateSalary,
    getSalary,
    getMySalary,
    getMyPayslip,
    getAllSalaries,
    getPayslipByEmployeeId
} from "../controllers/salary/salary.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { roleGuard } from "../middlewares/role.middleware.js";

const salaryRouter = Router();

salaryRouter.route("/")
    .post(verifyJWT, roleGuard("ADMIN", "HR"), createOrUpdateSalary)
    .get(verifyJWT, roleGuard("ADMIN", "HR"), getAllSalaries);

salaryRouter.route("/my")
    .get(verifyJWT, getMySalary);

salaryRouter.route("/payslip/my")
    .get(verifyJWT, getMyPayslip);

salaryRouter.route("/payslip/employee/:id")
    .get(verifyJWT, roleGuard("ADMIN", "HR"), getPayslipByEmployeeId);

salaryRouter.route("/employee/:id")
    .get(verifyJWT, roleGuard("ADMIN", "HR"), getSalary);

export default salaryRouter;
