import { Request, Response } from "express";
import * as TripService from "../services/tripService";
import { scheduleGetDaySchedule } from "../utils/scheduleClient";

export async function getAvailableSchedules(req: Request, res: Response) {
  try {
    const routeId = Number(req.params.routeId);
    const date = String(req.query.date);

    if (Number.isNaN(routeId) || !date) {
      return res.status(400).json({ message: "routeId and date are required" });
    }

    const authHeader = req.header("authorization");

    const schedule = await scheduleGetDaySchedule(date, authHeader);

    if (!schedule) {
      return res.json([]);
    }

    const hours = schedule.trips
      .filter((t) => t.routeId === routeId && t.departureTime)
      .map((t) => {
        const d = new Date(t.departureTime);
        if (isNaN(d.getTime())) return null;
        return {
          hour: d.toLocaleTimeString("en-GB", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          }),
        };
      })
      .filter(Boolean);

    res.json(hours);
  } catch (error) {
    console.error("Error in getAvailableSchedules:", error);
    res.status(502).json({ message: "Schedule service unavailable" });
  }
}

export async function selectSchedule(req: Request, res: Response) {
  try {
    const { routeId, date, hour } = req.body;

    if (!routeId || !date || !hour) {
      return res.status(400).json({ message: "Missing data" });
    }

    const authHeader = req.header("Authorization");

    const schedule = await scheduleGetDaySchedule(date, authHeader);

    if (!schedule) {
      return res.status(404).json({ message: "Schedule not found for this date" });
    }

    const trip = schedule.trips.find((t) => {
      if (Number(t.routeId) !== Number(routeId)) return false;

      const d = new Date(t.departureTime);
      if (isNaN(d.getTime())) return false;

      const h = d.toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });

      return h === hour;
    });

    if (!trip) {
      return res.status(404).json({ message: "Trip not found" });
    }

    res.json(trip);
  } catch (error) {
    console.error("Error in selectSchedule:", error);
    res.status(502).json({ message: "Schedule service unavailable" });
  }
}

export async function getTripsByIds(req: Request, res: Response) {
  try {
    const { ids } = req.query;

    if (!ids || typeof ids !== "string") {
      return res.status(400).json({ message: "ids query param required" });
    }

    const tripIds = ids
      .split(",")
      .map(Number)
      .filter(Number.isInteger);

    if (tripIds.length === 0) {
      return res.status(400).json({ message: "Invalid trip ids" });
    }

    const trips = await TripService.getTrips(tripIds);
    return res.json(trips);
  } catch (error) {
    console.error("Error in getTripsByIds:", error);
    return res.status(500).json({ message: "Error fetching trips" });
  }
}

export async function getTripsByRoute(req: Request, res: Response) {
  try {
    const { routeId, date } = req.query;

    if (!routeId || !date) {
      return res.status(400).json({ message: "routeId and date are required" });
    }

    const trips = await TripService.getTripsByRoute(
      Number(routeId),
      new Date(String(date))
    );

    res.json(trips);
  } catch (error) {
    console.error("Error in getTripsByRoute:", error);
    res.status(500).json({ message: "Error fetching trips by route" });
  }
}

export async function getTicketsByTrip(req: Request, res: Response) {
  try {
    const tripId = Number(req.params.tripId);

    if (Number.isNaN(tripId)) {
      return res.status(400).json({ message: "Invalid tripId" });
    }

    const tickets = await TripService.getTicketsByTrip(tripId);
    res.json(tickets);
  } catch (error) {
    console.error("Error in getTicketsByTrip:", error);
    res.status(500).json({ message: "Error fetching tickets" });
  }
}