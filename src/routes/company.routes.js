import { Router } from "express";
import { getCompanyDetails } from "../controllers/company/company.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { roleGuard } from "../middlewares/role.middleware.js";

const companyRouter = Router();

companyRouter.route("/details")
    .get(verifyJWT, roleGuard("ADMIN", "HR"), getCompanyDetails);

export default companyRouter;
