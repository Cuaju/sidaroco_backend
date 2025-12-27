import { Request, Response } from "express";
import { getTrips } from "../services/tripService";

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

    const trips = await getTrips(tripIds);
    return res.json(trips);
  } catch {
    return res.status(500).json({ message: "Error fetching trips" });
  }
}
