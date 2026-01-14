import { Router } from "express";
import { createEmployeeFromUser, loginUser, refreshAccessToken, registerUser, getAllUsers, getUserById } from "../controllers/user/user.controller.js";
import { searchUser } from "../controllers/user/search.user.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { roleGuard } from "../middlewares/role.middleware.js";
import upload from "../middlewares/upload.middleware.js"
const userRouter = Router();

userRouter.route("/pending").get(getAllUsers);
userRouter.route("/:id").get(getUserById);
userRouter.route("/register").post(registerUser);
userRouter.route("/login").post(loginUser);
userRouter.route("/refresh-token").post(refreshAccessToken);
userRouter.route("/search-user").get(verifyJWT,
    roleGuard("ADMIN", "HR"), searchUser);
userRouter.route("/create-employee").post(verifyJWT,
    roleGuard("ADMIN", "HR"), upload.single("image"), createEmployeeFromUser);
export default userRouter;
