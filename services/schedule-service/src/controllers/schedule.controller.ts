import { Request, Response } from "express";
import * as ScheduleService from "../services/schedule.service";

type RouteDTO = { id: string };
type DriverDTO = { id: number };
type BusDTO = { id: number; routeId?: string | null };

function mustEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env var ${name}`);
  return v;
}

async function httpGetJson<T>(
  url: string,
  req: Request,
  extraHeaders?: Record<string, string>
): Promise<{ status: number; json?: T }> {
  const authHeader = req.header("authorization");

  const headers: Record<string, string> = {
    ...(authHeader ? { Authorization: authHeader } : {}),
    ...(extraHeaders ?? {}),
  };

  const res = await fetch(url, { headers });

  if (!res.ok) return { status: res.status };
  const json = (await res.json()) as T;
  return { status: res.status, json };
}

export async function createEmptySchedule(req: Request, res: Response) {
  try {
    const rawDate = req.body.date;

    let date: Date;

    if (!rawDate) {
      date = new Date();
    } else {
      date = new Date(rawDate);
    }

    if (isNaN(date.getTime())) {
      return res.status(400).json({
        message: "Invalid date format. Use YYYY-MM-DD",
      });
    }

    const schedule = await ScheduleService.createSchedule({
      serviceDate: date,
      duplicatedFrom: null,
    });

    res.status(201).json(schedule);
  } catch (error) {
    if (error instanceof Error && error.message === "SCHEDULE_ALREADY_EXISTS") {
      return res.status(409).json({
        message: "Schedule for this date already exists",
      });
    }

    console.error("Error creating empty schedule:", error);
    res.status(500).json({ message: "Failed to create empty schedule" });
  }
}

export async function getScheduleForDay(req: Request, res: Response) {
  try {
    const rawDate = req.params.date;
    const date = new Date(rawDate);

    if (isNaN(date.getTime())) {
      return res.status(400).json({
        message: "Invalid date format. Use YYYY-MM-DD",
      });
    }

    const schedule = await ScheduleService.getByDate(date);

    if (!schedule) {
      return res.status(404).json({
        message: "Schedule not found",
      });
    }

    res.status(200).json(schedule);
  } catch (error) {
    console.error("Error fetching schedule:", error);
    res.status(500).json({ message: "Failed to fetch schedule" });
  }
}

export async function getTripById(req: Request, res: Response) {
  try {
    const tripId = Number(req.params.tripId);

    if (isNaN(tripId)) {
      return res.status(400).json({ message: "Invalid tripId" });
    }

    const trip = await ScheduleService.getTripById(tripId);

    if (!trip) {
      return res.status(404).json({ message: "Trip not found" });
    }

    res.status(200).json(trip);
  } catch (error) {
    console.error("Error fetching trip:", error);
    res.status(500).json({ message: "Failed to fetch trip" });
  }
}

export async function addTripToSchedule(req: Request, res: Response) {
  try {
    const {
      date: rawDate,
      routeId,
      busId,
      driverId,
      departureTime,
    } = req.body ?? {};

    if (!rawDate) return res.status(400).json({ message: "date is required" });
    if (!routeId)
      return res.status(400).json({ message: "routeId is required" });
    if (!busId) return res.status(400).json({ message: "busId is required" });
    if (!driverId)
      return res.status(400).json({ message: "driverId is required" });
    if (!departureTime)
      return res.status(400).json({ message: "departureTime is required" });

    const date = new Date(rawDate);

    if (isNaN(date.getTime())) {
      return res
        .status(400)
        .json({ message: "Invalid date format. Use YYYY-MM-DD" });
    }

    if (!/^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/.test(departureTime)) {
      return res
        .status(400)
        .json({ message: "departureTime must be HH:MM or HH:MM:SS" });
    }



    const ROUTE_SERVICE_URL =
      process.env.ROUTE_SERVICE_URL || "http://localhost:3001";
    const FLEET_SERVICE_URL =
      process.env.FLEET_SERVICE_URL || "http://localhost:3002";

    const routeResp = await httpGetJson<RouteDTO>(
      `${ROUTE_SERVICE_URL}/routes/${routeId}`,
      req
    );
    if (routeResp.status === 404)
      return res.status(400).json({ message: "routeId not found" });
    if (routeResp.status >= 400)
      return res.status(502).json({ message: "Failed to validate routeId" });

    const busResp = await httpGetJson<BusDTO>(
      `${FLEET_SERVICE_URL}/buses/${busId}`,
      req
    );
    if (busResp.status === 404)
      return res.status(400).json({ message: "busId not found" });
    if (busResp.status >= 400)
      return res.status(502).json({ message: "Failed to validate busId" });

    const driverResp = await httpGetJson<DriverDTO>(
      `${FLEET_SERVICE_URL}/drivers/${driverId}`,
      req
    );
    if (driverResp.status === 404)
      return res.status(400).json({ message: "driverId not found" });
    if (driverResp.status >= 400)
      return res.status(502).json({ message: "Failed to validate driverId" });

    const bus = busResp.json!;
    if (bus.routeId != null && Number(bus.routeId) !== Number(routeId)) {
      return res
        .status(400)
        .json({ message: "Bus is not assigned to the given routeId" });
    }


    const [hours, minutes, seconds = "0"] = departureTime.split(":");
    const departureDate = new Date(date);
    departureDate.setHours(Number(hours), Number(minutes), Number(seconds), 0);

    const trip = await ScheduleService.addTripToSchedule({
      date,
      routeId: Number(routeId),
      busId: Number(busId),
      driverId: Number(driverId),
      departureTime: departureDate,
    });

    res.status(201).json(trip);
  } catch (error) {
    if (error instanceof Error && error.message === "SCHEDULE_IS_LOCKED") {
      return res.status(409).json({ message: "Schedule for this date is locked" });
    }
    console.error("Error creating trip: ", error);
    res.status(500).json({ message: "Failed to create trip for this date" });
  }
}

export async function removeTripFromSchedule(req: Request, res: Response) {
  try {
    const tripId = Number(req.params.tripId);

    if (isNaN(tripId)) {
      return res.status(400).json({ message: "Invalid tripId" });
    }

    const trip = await ScheduleService.getTripById(tripId);
    if (!trip) {
      return res.status(404).json({ message: "Trip not found" });
    }

    // Check if the schedule is locked
    const schedule = await ScheduleService.getScheduleById(trip.dailyScheduleId);
    if (schedule?.isLocked) {
      return res.status(409).json({ message: "Schedule is locked" });
    }

    const deletedTrip = await ScheduleService.deleteTrip(tripId);
    res.status(200).json(deletedTrip);
  } catch (error) {
    console.error("Error removing trip:", error);
    res.status(500).json({ message: "Failed to remove trip" });
  }
}

export async function updateTripInSchedule(req: Request, res: Response) {
  try {
    const tripId = Number(req.params.tripId);

    if (isNaN(tripId)) {
      return res.status(400).json({ message: "Invalid tripId" });
    }

    const trip = await ScheduleService.getTripById(tripId);
    if (!trip) {
      return res.status(404).json({ message: "Trip not found" });
    }

    // Check if the schedule is locked
    const schedule = await ScheduleService.getScheduleById(trip.dailyScheduleId);
    if (schedule?.isLocked) {
      return res.status(409).json({ message: "Schedule is locked" });
    }

    const { routeId, busId, driverId, departureTime } = req.body ?? {};

    const updateData: Parameters<typeof ScheduleService.updateTrip>[1] = {};

    if (routeId !== undefined) updateData.routeId = Number(routeId);
    if (busId !== undefined) updateData.busId = Number(busId);
    if (driverId !== undefined) updateData.driverId = Number(driverId);

    if (departureTime !== undefined) {
      if (!/^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/.test(departureTime)) {
        return res
          .status(400)
          .json({ message: "departureTime must be HH:MM or HH:MM:SS" });
      }
      const [hours, minutes, seconds = "0"] = departureTime.split(":");
      const departureDate = new Date();
      departureDate.setHours(Number(hours), Number(minutes), Number(seconds), 0);
      updateData.departureTime = departureDate;
    }

    const updatedTrip = await ScheduleService.updateTrip(tripId, updateData);
    res.status(200).json(updatedTrip);
  } catch (error) {
    console.error("Error updating trip:", error);
    res.status(500).json({ message: "Failed to update trip" });
  }
}

export async function deleteScheduleForDay(req: Request, res: Response) {
  try {
    const rawDate = req.params.date;
    const date = new Date(rawDate);

    if (isNaN(date.getTime())) {
      return res.status(400).json({
        message: "Invalid date format. Use YYYY-MM-DD",
      });
    }

    const schedule = await ScheduleService.getScheduleByDate(date);
    if (!schedule) {
      return res.status(404).json({ message: "Schedule not found" });
    }

    if (schedule.isLocked) {
      return res.status(409).json({ message: "Schedule is locked" });
    }

    const deletedSchedule = await ScheduleService.deleteSchedule(schedule.id);
    res.status(200).json(deletedSchedule);
  } catch (error) {
    console.error("Error deleting schedule:", error);
    res.status(500).json({ message: "Failed to delete schedule" });
  }
}

export async function lockScheduleForDay(req: Request, res: Response) {
  try {
    const rawDate = req.params.date;
    const date = new Date(rawDate);

    if (isNaN(date.getTime())) {
      return res.status(400).json({
        message: "Invalid date format. Use YYYY-MM-DD",
      });
    }

    const schedule = await ScheduleService.getScheduleByDate(date);
    if (!schedule) {
      return res.status(404).json({ message: "Schedule not found" });
    }

    const lockedSchedule = await ScheduleService.lockSchedule(schedule.id);
    res.status(200).json(lockedSchedule);
  } catch (error) {
    console.error("Error locking schedule:", error);
    res.status(500).json({ message: "Failed to lock schedule" });
  }
}

export async function unlockScheduleForDay(req: Request, res: Response) {
  try {
    const rawDate = req.params.date;
    const date = new Date(rawDate);

    if (isNaN(date.getTime())) {
      return res.status(400).json({
        message: "Invalid date format. Use YYYY-MM-DD",
      });
    }

    const schedule = await ScheduleService.getScheduleByDate(date);
    if (!schedule) {
      return res.status(404).json({ message: "Schedule not found" });
    }

    const unlockedSchedule = await ScheduleService.unlockSchedule(schedule.id);
    res.status(200).json(unlockedSchedule);
  } catch (error) {
    console.error("Error unlocking schedule:", error);
    res.status(500).json({ message: "Failed to unlock schedule" });
  }
}

export async function cancelTripInSchedule(req: Request, res: Response) {
  try {
    const tripId = Number(req.params.tripId);

    if (isNaN(tripId)) {
      return res.status(400).json({ message: "Invalid tripId" });
    }

    const trip = await ScheduleService.getTripById(tripId);
    if (!trip) {
      return res.status(404).json({ message: "Trip not found" });
    }

    const canceledTrip = await ScheduleService.updateTrip(tripId, {
      status: "canceled",
    });
    res.status(200).json(canceledTrip);
  } catch (error) {
    console.error("Error canceling trip:", error);
    res.status(500).json({ message: "Failed to cancel trip" });
  }
}

export async function completeTripInSchedule(req: Request, res: Response) {
  try {
    const tripId = Number(req.params.tripId);

    if (isNaN(tripId)) {
      return res.status(400).json({ message: "Invalid tripId" });
    }

    const trip = await ScheduleService.getTripById(tripId);
    if (!trip) {
      return res.status(404).json({ message: "Trip not found" });
    }

    const completedTrip = await ScheduleService.updateTrip(tripId, {
      status: "completed",
    });
    res.status(200).json(completedTrip);
  } catch (error) {
    console.error("Error completing trip:", error);
    res.status(500).json({ message: "Failed to complete trip" });
  }
}

export async function duplicateSchedule(req: Request, res: Response) {
  try {
    const rawSourceDate = req.params.date;
    const { targetDate: rawTargetDate } = req.body ?? {};

    if (!rawTargetDate) {
      return res.status(400).json({ message: "targetDate is required" });
    }

    const sourceDate = new Date(rawSourceDate);
    const targetDate = new Date(rawTargetDate);

    if (isNaN(sourceDate.getTime())) {
      return res.status(400).json({
        message: "Invalid source date format. Use YYYY-MM-DD",
      });
    }

    if (isNaN(targetDate.getTime())) {
      return res.status(400).json({
        message: "Invalid target date format. Use YYYY-MM-DD",
      });
    }

    const duplicatedSchedule = await ScheduleService.duplicateSchedule(
      sourceDate,
      targetDate
    );
    res.status(201).json(duplicatedSchedule);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "SOURCE_SCHEDULE_NOT_FOUND") {
        return res.status(404).json({ message: "Source schedule not found" });
      }
      if (error.message === "TARGET_SCHEDULE_ALREADY_EXISTS") {
        return res.status(409).json({ message: "Target date already has a schedule" });
      }
    }
    console.error("Error duplicating schedule:", error);
    res.status(500).json({ message: "Failed to duplicate schedule" });
  }
}

export async function getSummary(req: Request, res: Response) {
  try {
    const summary = await ScheduleService.getSummary();
    res.status(200).json(summary);
  } catch (error) {
    console.error("Error fetching summary:", error);
    res.status(500).json({ message: "Failed to fetch summary" });
  }
}

export async function getSchedulesInRange(req: Request, res: Response) {
  try {
    const { from, to } = req.query;

    if (!from || !to) {
      return res.status(400).json({
        message: "Both 'from' and 'to' query parameters are required",
      });
    }

    const fromDate = new Date(from as string);
    const toDate = new Date(to as string);

    if (isNaN(fromDate.getTime())) {
      return res.status(400).json({
        message: "Invalid 'from' date format. Use YYYY-MM-DD",
      });
    }

    if (isNaN(toDate.getTime())) {
      return res.status(400).json({
        message: "Invalid 'to' date format. Use YYYY-MM-DD",
      });
    }

    if (fromDate > toDate) {
      return res.status(400).json({
        message: "'from' date must be before or equal to 'to' date",
      });
    }

    const schedules = await ScheduleService.getSchedulesInRange(fromDate, toDate);
    res.status(200).json(schedules);
  } catch (error) {
    console.error("Error fetching schedules in range:", error);
    res.status(500).json({ message: "Failed to fetch schedules in range" });
  }
}

export async function getScheduleById(req: Request, res: Response) {
  try{
    const scheduleId = Number(req.params.id);

    if (isNaN(scheduleId)) {
      return res.status(400).json({ message: "Invalid schedule ID" });
    }

    const schedule = await ScheduleService.getScheduleById(scheduleId);

    if (!schedule) {
      return res.status(404).json({ message: "Schedule not found" });
    }

    res.status(200).json(schedule);

  }catch (error) {
    console.error("Error fetching schedule by ID:", error);
    res.status(500).json({ message: "Failed to fetch schedule by ID" });
  }
}

export async function getTripIdsInRange(req: Request, res: Response) {
  try {
    const { from, to } = req.query;

    if (!from || !to) {
      return res.status(400).json({
        message: "Both 'from' and 'to' query parameters are required",
      });
    }

    const fromDate = new Date(from as string);
    const toDate = new Date(to as string);

    if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) {
      return res.status(400).json({
        message: "Invalid date format. Use YYYY-MM-DD",
      });
    }

    const trips = await ScheduleService.getTripIdsInRange(fromDate, toDate);
    res.status(200).json(trips);
  } catch (error) {
    console.error("Error fetching trip IDs in range:", error);
    res.status(500).json({ message: "Failed to fetch trip IDs" });
  }
}

