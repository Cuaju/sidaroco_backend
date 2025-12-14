import { Router } from "express";
import multer from "multer";
import { requireAuth } from "../middlewares/auth";
import * as DriverController from "../controllers/driver.controller";

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });


router.post("/", requireAuth, upload.single("photo"), DriverController.createDriver);
router.get("/:id", requireAuth, DriverController.getDriverById);
router.get("/", requireAuth, DriverController.getAllDrivers);
router.put("/:id", requireAuth, upload.single("photo"), DriverController.updateDriver);
router.delete("/:id", requireAuth, DriverController.deleteDriver);


export default router;