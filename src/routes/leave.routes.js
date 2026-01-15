import { Router } from "express";
import {
    createPolicy,
    getAllPolicies,
    updatePolicy,
    applyLeave,
    getPendingLeaves,
    approveLeave,
    rejectLeave,
    getMyLeaves
} from "../controllers/leave/leave.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { roleGuard } from "../middlewares/role.middleware.js";

const leaveRouter = Router();

leaveRouter.route("/policies")
    .post(verifyJWT, roleGuard("ADMIN", "HR"), createPolicy)
    .get(verifyJWT, getAllPolicies); 

leaveRouter.route("/policies/:id")
    .patch(verifyJWT, roleGuard("ADMIN", "HR"), updatePolicy);
leaveRouter.route("/apply")
    .post(verifyJWT, applyLeave);

leaveRouter.route("/pending")
    .get(verifyJWT, roleGuard("ADMIN", "HR"), getPendingLeaves);

leaveRouter.route("/:id/approve")
    .patch(verifyJWT, roleGuard("ADMIN", "HR"), approveLeave);

leaveRouter.route("/:id/reject")
    .patch(verifyJWT, roleGuard("ADMIN", "HR"), rejectLeave);

leaveRouter.route("/my")
    .get(verifyJWT, getMyLeaves);

export default leaveRouter;
