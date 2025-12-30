import { Router } from "express";
import multer from "multer";
import { requireAuth } from "../middlewares/auth";
import * as DriverController from "../controllers/driver.controller";

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });


router.post("/", upload.single("photo"), DriverController.createDriver);
router.get("/:id", DriverController.getDriverById);
router.get("/", DriverController.getAllDrivers);
router.put("/:id", upload.single("photo"), DriverController.updateDriver);
router.delete("/:id", DriverController.deleteDriver);


export default router;