import { Router } from "express";
import * as DriverController from "../controllers/driver.controller";

const { Authorize } = require("@sidaroco/auth_middleware");

const router = Router();

// GET /driver/trips?from=YYYY-MM-DD&to=YYYY-MM-DD
router.get("/trips", Authorize({ roles: ["Driver"] }), DriverController.getMyTrips);

// GET /driver/trips/:tripId
router.get("/trips/:tripId", Authorize({ roles: ["Driver"] }), DriverController.getTripDetail);

// GET /driver/trips/:tripId/passengers
router.get("/trips/:tripId/passengers", Authorize({ roles: ["Driver"] }), DriverController.getTripPassengers);

export default router;
