import { Router } from "express";
import multer from "multer";
import * as BusController from "../controllers/bus.controller";
const { Authorize } = require("@sidaroco/auth_middleware");

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post("/",  upload.single("photo"), BusController.createBus);
router.get("/:id",  BusController.getBusById);
router.get("/",  Authorize({roles:["RouteManager"]}), BusController.getAllBuses);
router.put("/:id",  upload.single("photo"), BusController.updateBus);
router.delete("/:id", BusController.deleteBus);

export default router;