import { Router } from "express";
import { createNewAccount,updateAccount, updatePassword } from "../controllers/internalAuthController";
import { allowSelfOrRoles } from "../middlewares/rolesVerifier";

const { Authorize } = require("@sidaroco/auth_middleware");

export const internalRouter = Router();

internalRouter.post("/internal/newAccount", createNewAccount);

internalRouter.patch(
  "/accounts/:id",Authorize(),allowSelfOrRoles(["RouteManager", "FinanceManager"]), updateAccount);

internalRouter.patch(
  "/accounts/:id/password",Authorize(),allowSelfOrRoles(["RouteManager", "FinanceManager"]),updatePassword);
