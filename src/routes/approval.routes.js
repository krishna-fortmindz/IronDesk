import { Router } from "express";
import {
    createApprovalRequest,
    getPendingApprovals,
    getAllApprovals,
    approveRequest,
    rejectRequest,
    getMyApprovals
} from "../controllers/approval/approval.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { roleGuard } from "../middlewares/role.middleware.js";

const approvalRouter = Router();

approvalRouter.route("/")
    .post(verifyJWT, createApprovalRequest)
    .get(verifyJWT, roleGuard("ADMIN", "HR"), getAllApprovals);

approvalRouter.route("/pending")
    .get(verifyJWT, roleGuard("ADMIN", "HR"), getPendingApprovals);

approvalRouter.route("/my")
    .get(verifyJWT, getMyApprovals);

approvalRouter.route("/:id/approve")
    .patch(verifyJWT, roleGuard("ADMIN", "HR"), approveRequest);

approvalRouter.route("/:id/reject")
    .patch(verifyJWT, roleGuard("ADMIN", "HR"), rejectRequest);

export default approvalRouter;