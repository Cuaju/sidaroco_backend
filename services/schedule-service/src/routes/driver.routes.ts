import { Router } from "express";
import * as DriverController from "../controllers/driver.controller";

const { Authorize } = require("@sidaroco/auth_middleware");

const router = Router();

router.get("/trips", Authorize({ roles: ["Driver"] }), DriverController.getMyTrips);
router.get("/trips/:tripId", Authorize({ roles: ["Driver"] }), DriverController.getTripDetail);
router.get("/trips/:tripId/passengers", Authorize({ roles: ["Driver"] }), DriverController.getTripPassengers);

export default router;
