import { Router } from "express";
import multer from "multer";
import { requireAuth } from "../middlewares/auth";
import * as BusController from "../controllers/bus.controller";

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post("/", requireAuth, upload.single("photo"), BusController.createDriver);
router.get("/:id", requireAuth, BusController.getBusById);
router.get("/", requireAuth, BusController.getAllBuses);
router.put("/:id", requireAuth, upload.single("photo"), BusController.updateBus);
router.delete("/:id", requireAuth, BusController.deleteBus);

export default router;