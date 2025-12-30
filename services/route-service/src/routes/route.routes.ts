import { Router } from "express";
import { RouteController } from "../controllers/router.controller";

export const routeRouter = Router();

routeRouter.get("/", RouteController.list);
routeRouter.get("/:id", RouteController.getById);
routeRouter.post("/", RouteController.create);
routeRouter.delete("/:id", RouteController.remove);
routeRouter.put("/:id", RouteController.update);
