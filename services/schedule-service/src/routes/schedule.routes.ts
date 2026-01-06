import { Router } from "express";
import * as ScheduleController from "../controllers/schedule.controller";
const {Authorize} = require("@sidaroco/auth_middleware")
const router = Router();

// Summary for calendar overview
router.get("/summary", Authorize({roles:["RouteManager"]}), ScheduleController.getSummary);

// Schedules in a date range
router.get("/range", Authorize({roles:["RouteManager", "FinanceManager", "Customer", "Cashier"]}), ScheduleController.getSchedulesInRange);

// An specific scheduled trip by ID
router.get("/trip/:tripId", Authorize({roles:["RouteManager", "FinanceManager", "Customer", "Cashier"]}), ScheduleController.getTripById);

// Create an empty schedule
router.post("/",Authorize({roles:["RouteManager"]}), ScheduleController.createEmptySchedule);

// Get a full daily schedule for a day
router.get("/:date", Authorize({roles:["RouteManager", "FinanceManager", "Customer", "Cashier"]}), ScheduleController.getScheduleForDay);

// Duplicate a schedule from one day to another
router.post("/:date/duplicate", Authorize({roles:["RouteManager"]}), ScheduleController.duplicateSchedule);

// Add a trip to a day
router.post("/:date/trip", Authorize({roles:["RouteManager"]}), ScheduleController.addTripToSchedule);

// Remove a trip from a day
router.delete("/:date/trip/:tripId", Authorize({roles:["RouteManager"]}), ScheduleController.removeTripFromSchedule);

// Update a trip
router.put("/:date/trip/:tripId", Authorize({roles:["RouteManager"]}), ScheduleController.updateTripInSchedule);

// Delete a whole day's schedule
router.delete("/:date", Authorize({roles:["RouteManager"]}), ScheduleController.deleteScheduleForDay);

// Lock a day's schedule
router.post("/:date/lock",Authorize({roles:["RouteManager"]}), ScheduleController.lockScheduleForDay);

// Unlock a day's schedule
router.post("/:date/unlock", Authorize({roles:["RouteManager"]}), ScheduleController.unlockScheduleForDay);

// Cancel a trip
router.post("/:date/trip/:tripId/cancel",  Authorize({roles:["RouteManager"]}),ScheduleController.cancelTripInSchedule);

// Complete a trip
router.post("/:date/trip/:tripId/complete",Authorize({roles:["RouteManager"]}), ScheduleController.completeTripInSchedule);

router.get("/byId/:id", Authorize({roles:["RouteManager", "Cashier", "Customer"]}), ScheduleController.getScheduleById);

router.get("/byId/:id", Authorize({roles:["RouteManager", "Cashier", "Customer"]}), ScheduleController.getScheduleById);

router.get("/trips/ids", Authorize({roles:["RouteManager", "FinanceManager", "Cashier", "Customer"]}), ScheduleController.getTripIdsInRange);

export default router;
