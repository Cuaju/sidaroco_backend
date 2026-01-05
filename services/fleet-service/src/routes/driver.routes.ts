import { Router } from "express";
import multer from "multer";
import { requireAuth } from "../middlewares/auth";
import * as DriverController from "../controllers/driver.controller";
const {Authorize} = require("@sidaroco/auth_middleware")
const router = Router();
const upload = multer({ storage: multer.memoryStorage() });


router.post("/",Authorize({roles:["RouteManager"]}), upload.single("photo"), DriverController.createDriver);
router.get("/:id",Authorize({roles:["RouteManager"]}), DriverController.getDriverById);
router.get("/",Authorize({roles:["RouteManager"]}), DriverController.getAllDrivers);
router.put("/:id",Authorize({roles:["RouteManager"]}), upload.single("photo"), DriverController.updateDriver);
router.delete("/:id",Authorize({roles:["RouteManager"]}), DriverController.deleteDriver);


export default router;