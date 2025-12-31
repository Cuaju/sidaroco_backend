import { Router } from "express";
import * as TripController from "../controllers/tripController";

const router = Router();

router.get("/:routeId/schedules", TripController.getAvailableSchedules);
router.post("/selectSchedule", TripController.selectSchedule);
router.get("/byIds", TripController.getTripsByIds);
router.get("/byRoute", TripController.getTripsByRoute);
router.get("/:tripId/tickets", TripController.getTicketsByTrip);

export default router;
