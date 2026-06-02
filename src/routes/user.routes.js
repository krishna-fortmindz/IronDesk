import { Router } from "express";
import { createEmployeeFromUser, loginUser, refreshAccessToken, registerUser, getAllUsers, getUserById, logoutUser, assignUserToCompany } from "../controllers/user/user.controller.js";
import { searchUser } from "../controllers/user/search.user.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { roleGuard } from "../middlewares/role.middleware.js";
import upload from "../middlewares/upload.middleware.js"
const userRouter = Router();

userRouter.route("/register").post(registerUser);
userRouter.route("/login").post(loginUser);
userRouter.route("/logout").post(verifyJWT, logoutUser);
userRouter.route("/refresh-token").post(refreshAccessToken);
userRouter.route("/pending").get(verifyJWT, roleGuard("ADMIN", "HR"), getAllUsers);
userRouter.route("/search-user").get(verifyJWT, roleGuard("ADMIN", "HR"), searchUser);
userRouter.route("/create-employee").post(verifyJWT, roleGuard("ADMIN", "HR"), upload.single("image"), createEmployeeFromUser);
userRouter.route("/assign-company").post(verifyJWT, roleGuard("ADMIN"), assignUserToCompany);
userRouter.route("/:id").get(verifyJWT, getUserById);
export default userRouter;
