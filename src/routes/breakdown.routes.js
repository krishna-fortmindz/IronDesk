import { Router } from "express";
import {
    reportBreakdown,
    getAllBreakdowns,
    getMyBreakdowns,
    getBreakdownById,
    updateBreakdownStatus
} from "../controllers/breakdown/breakdown.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { roleGuard } from "../middlewares/role.middleware.js";

const breakdownRouter = Router();

breakdownRouter.route("/")
    .post(verifyJWT, reportBreakdown)
    .get(verifyJWT, roleGuard("ADMIN", "HR"), getAllBreakdowns);

breakdownRouter.route("/my")
    .get(verifyJWT, getMyBreakdowns);

breakdownRouter.route("/:id")
    .get(verifyJWT, getBreakdownById)
    .patch(verifyJWT, roleGuard("ADMIN", "HR"), updateBreakdownStatus);

export default breakdownRouter;