import { Router } from "express";
import * as TripController from "../controllers/tripController";
const {Authorize} = require("@sidaroco/auth_middleware")

const router = Router();

router.get("/:routeId/schedules", Authorize({roles:["Customer", "Cashier"]}), TripController.getAvailableSchedules);
router.post("/selectSchedule", Authorize({roles:["Customer", "Cashier"]}), TripController.selectSchedule);
router.get("/byIds", Authorize({roles:["Customer", "Cashier"]}), TripController.getTripsByIds);
router.get("/byRoute", Authorize({roles:["Customer", "Cashier"]}),TripController.getTripsByRoute);
router.get("/:tripId/tickets", Authorize({roles:["Customer", "Cashier"]}), TripController.getTicketsByTrip);

export default router;
