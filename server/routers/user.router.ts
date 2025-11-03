import { Router } from "express";
import * as userController from "../controllers/user.controller";

const userRouter = Router();

userRouter.post("/login", userController.login);
userRouter.post("/logout", userController.logout);
userRouter.get("/me", userController.me);

export default userRouter;