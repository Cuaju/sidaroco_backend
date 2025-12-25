import { Router } from "express";
import * as ScheduleController from "../controllers/schedule.controller";

const router = Router();

// Create an empty schedule
router.post("/", ScheduleController.createEmptySchedule);

// Get a full daily schedule for a day
router.get("/:date", ScheduleController.getScheduleForDay);

// Duplicate a schedule from one day to another
router.post("/:date/duplicate", ScheduleController.duplicateSchedule);

// Add a trip to a day
router.post("/:date/trip", ScheduleController.addTripToSchedule);

// Remove a trip from a day
router.delete("/:date/trip/:tripId", ScheduleController.removeTripFromSchedule);

// Update a trip
router.put("/:date/trip/:tripId", ScheduleController.updateTripInSchedule);

// Delete a whole day's schedule
router.delete("/:date", ScheduleController.deleteScheduleForDay);

// Lock a day's schedule
router.post("/:date/lock", ScheduleController.lockScheduleForDay);

// Unlock a day's schedule
router.post("/:date/unlock", ScheduleController.unlockScheduleForDay);

// Cancel a trip
router.post("/:date/trip/:tripId/cancel", ScheduleController.cancelTripInSchedule);

// Complete a trip
router.post("/:date/trip/:tripId/complete", ScheduleController.completeTripInSchedule);

export default router;
