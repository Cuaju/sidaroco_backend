import { Router } from "express";
import { getAdminAccounts,createAdminAccountWithProfile,setAdminActive,requestRegisterCode,verifyRegisterCode,register, createProfileForExistingAccount, getMe, patchMe, changeMyPassword } from "../controllers/usersController";

const { Authorize } = require("@sidaroco/auth_middleware");

export const usersRouter = Router();

usersRouter.post("/register", register);
usersRouter.post("/profile", createProfileForExistingAccount);

usersRouter.get("/me", Authorize(), getMe);
usersRouter.patch("/me", Authorize(), patchMe);
usersRouter.patch("/me/password", Authorize(), changeMyPassword);
usersRouter.post("/register/request", requestRegisterCode);
usersRouter.post("/register/verify", verifyRegisterCode);
usersRouter.get("/admin/accounts", Authorize(), getAdminAccounts);
usersRouter.post("/admin/accounts", Authorize(), createAdminAccountWithProfile);
usersRouter.patch("/admin/accounts/:accountId/active", Authorize(), setAdminActive);