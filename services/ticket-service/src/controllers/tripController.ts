import { Request, Response } from "express";
import * as TripService from "../services/tripService";
//FIXME Implement proper call to Schedule service 
export async function getAvailableSchedules(req: Request, res: Response) {
  const routeId = Number(req.params.routeId);

  if (Number.isNaN(routeId)) {
    return res.status(400).json({ message: "Invalid routeId" });
  }

  const schedules = TripService.getAvailableSchedules(routeId);
  res.json(schedules.map(hour => ({ hour })));
}

export async function selectSchedule(req: Request, res: Response) {
  const { routeId, date, hour } = req.body;

  if (!routeId || !date || !hour) {
    return res.status(400).json({ message: "Missing data" });
  }

  const trip = await TripService.getOrCreateTrip(
    Number(routeId),
    String(date),
    String(hour)
  );

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