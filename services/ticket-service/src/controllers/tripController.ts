import { Request, Response } from "express";
import * as TripService from "../services/tripService";

const SCHEDULE_SERVICE_URL =
  process.env.SCHEDULE_SERVICE_URL || "http://localhost:3006";

export async function getAvailableSchedules(req: Request, res: Response) {
  const routeId = Number(req.params.routeId);
  const date = String(req.query.date);

  if (Number.isNaN(routeId) || !date) {
    return res.status(400).json({ message: "routeId and date are required" });
  }

  const response = await fetch(
    `${SCHEDULE_SERVICE_URL}/schedule/${date}`
  );

  if (response.status === 404) {
    return res.json([]);
  }

  if (!response.ok) {
    return res.status(502).json({ message: "Schedule service unavailable" });
  }

  const schedule = await response.json();

  const hours = schedule.trips
    .filter((t: any) => t.routeId === routeId && t.departureTime)
    .map((t: any) => {
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
}

export async function selectSchedule(req: Request, res: Response) {
  const { routeId, date, hour } = req.body;

  if (!routeId || !date || !hour) {
    return res.status(400).json({ message: "Missing data" });
  }

  const response = await fetch(
    `${SCHEDULE_SERVICE_URL}/schedule/${date}`
  );

  if (!response.ok) {
    return res.status(502).json({ message: "Schedule service unavailable" });
  }

  const schedule = await response.json();

  const trip = schedule.trips.find((t: any) => {
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
  } catch {
    return res.status(500).json({ message: "Error fetching trips" });
  }
}

export async function getTripsByRoute(req: Request, res: Response) {
  const { routeId, date } = req.query;

  if (!routeId || !date) {
    return res.status(400).json({ message: "routeId and date are required" });
  }

  const trips = await TripService.getTripsByRoute(
    Number(routeId),
    new Date(String(date))
  );

  res.json(trips);
}

export async function getTicketsByTrip(req: Request, res: Response) {
  const tripId = Number(req.params.tripId);

  if (Number.isNaN(tripId)) {
    return res.status(400).json({ message: "Invalid tripId" });
  }

  const tickets = await TripService.getTicketsByTrip(tripId);
  res.json(tickets);
}