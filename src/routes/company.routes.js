import { Router } from "express";
import { createCompany, getAllCompanies, getCompanyDetails, updateCompany } from "../controllers/company/company.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { roleGuard } from "../middlewares/role.middleware.js";

const companyRouter = Router();

companyRouter.route("/")
    .post(verifyJWT, roleGuard("ADMIN"), createCompany)
    .get(verifyJWT, roleGuard("ADMIN"), getAllCompanies);

companyRouter.route("/details")
    .get(verifyJWT, roleGuard("ADMIN", "HR"), getCompanyDetails);

companyRouter.route("/:id")
    .patch(verifyJWT, roleGuard("ADMIN"), updateCompany);

export default companyRouter;
