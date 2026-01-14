import { Router } from "express";
import { getAllEmployee } from "../controllers/employee/employee.controller.js";
import { updateEmployee } from "../controllers/employee/employee.controller.js";
const employeeRouter = Router();

employeeRouter.route("/").get(getAllEmployee);
employeeRouter.route("/:id").patch(updateEmployee);
export default employeeRouter;