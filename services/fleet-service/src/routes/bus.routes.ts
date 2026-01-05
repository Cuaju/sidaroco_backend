import { Router } from "express";
import multer from "multer";
import * as BusController from "../controllers/bus.controller";
const { Authorize } = require("@sidaroco/auth_middleware");

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post("/", Authorize({roles:["RouteManager"]}), upload.single("photo"), BusController.createBus);
router.get("/:id",Authorize({roles:["RouteManager", "Customer", "Cashier"]}),  BusController.getBusById);
router.get("/",  Authorize({roles:["RouteManager"]}), BusController.getAllBuses);
router.put("/:id",Authorize({roles:["RouteManager"]}),  upload.single("photo"), BusController.updateBus);
router.delete("/:id",Authorize({roles:["RouteManager"]}), BusController.deleteBus);

export default router;