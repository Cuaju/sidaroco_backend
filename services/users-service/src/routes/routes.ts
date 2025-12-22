import { Router } from "express";
import { register, createProfileForExistingAccount, getMe, patchMe, changeMyPassword } from "../controllers/usersController";

const { Authorize } = require("@sidaroco/auth_middleware");

export const usersRouter = Router();

usersRouter.post("/register", register);
usersRouter.post("/profile", createProfileForExistingAccount);

usersRouter.get("/me", Authorize(), getMe);
usersRouter.patch("/me", Authorize(), patchMe);
usersRouter.patch("/me/password", Authorize(), changeMyPassword);
