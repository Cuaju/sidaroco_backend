import { Router } from "express";
import { RouteController } from "../controllers/router.controller";
import multer from "multer";

const upload = multer({ storage: multer.memoryStorage() });

export const routeRouter = Router();

routeRouter.get("/featured", RouteController.getFeatured);
routeRouter.get("/", RouteController.list);
routeRouter.get("/:id", RouteController.getById);
routeRouter.post("/", upload.single("photo"), RouteController.create);
routeRouter.delete("/:id", RouteController.remove);
routeRouter.put("/:id", upload.single("photo"), RouteController.update);
routeRouter.patch("/:id/toggleFeatured", RouteController.toggleFeatured);
