import { Router } from "express";
import { RouteController } from "../controllers/router.controller";
import multer from "multer";
const {Authorize} = require("@sidaroco/auth_middleware")
const upload = multer({ storage: multer.memoryStorage() });

export const routeRouter = Router();

routeRouter.get("/featured",Authorize({roles:["RouteManager", "Customer" ]}), RouteController.getFeatured);
routeRouter.get("/",Authorize({roles:["RouteManager", "Customer", "Cashier", "FinanceManager"]}), RouteController.list);
routeRouter.get("/:id", Authorize({roles:["RouteManager", "FinanceManager", "Customer", "Cashier"]}), RouteController.getById);
routeRouter.post("/", Authorize({roles:["RouteManager"]}), upload.single("photo"), RouteController.create);
routeRouter.delete("/:id",Authorize({roles:["RouteManager"]}), RouteController.remove);
routeRouter.put("/:id",Authorize({roles:["RouteManager"]}), upload.single("photo"), RouteController.update);
routeRouter.patch("/:id/toggleFeatured",Authorize({roles:["RouteManager"]}), RouteController.toggleFeatured);
