import { Router } from "express";
import { getAllEmployee, getEmployeeById, updateEmployee, deactivateEmployee, activateEmployee } from "../controllers/employee/employee.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { roleGuard } from "../middlewares/role.middleware.js";

const employeeRouter = Router();

employeeRouter.route("/")
    .get(verifyJWT, roleGuard("ADMIN", "HR"), getAllEmployee);

employeeRouter.route("/:id")
    .get(verifyJWT, roleGuard("ADMIN", "HR"), getEmployeeById)
    .patch(verifyJWT, roleGuard("ADMIN", "HR"), updateEmployee);

employeeRouter.route("/:id/deactivate")
    .patch(verifyJWT, roleGuard("ADMIN", "HR"), deactivateEmployee);

employeeRouter.route("/:id/activate")
    .patch(verifyJWT, roleGuard("ADMIN", "HR"), activateEmployee);

export default employeeRouter;