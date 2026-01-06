import { Router } from "express";
import { createNewAccount, getAccount , createNewAccountHashed,updateAccount, updatePassword, createAdminAccount, getAdminAccounts, patchAdminActive } from "../controllers/internalAuthController";
import { allowSelfOrRoles } from "../middlewares/rolesVerifier";

const { Authorize } = require("@sidaroco/auth_middleware");

export const internalRouter = Router();

internalRouter.post("/internal/newAccount", createNewAccount);

internalRouter.patch("/internal/accounts/:id",Authorize(), updateAccount);

internalRouter.patch("/internal/accounts/:id/password",Authorize(), updatePassword);

internalRouter.post("/internal/newAccountHashed", createNewAccountHashed);

internalRouter.get("/internal/accounts/:id", Authorize(), getAccount);

internalRouter.post("/internal/admin/accounts", createAdminAccount);
internalRouter.get("/internal/admin/accounts", getAdminAccounts);
internalRouter.patch("/internal/admin/accounts/:id/active", patchAdminActive);