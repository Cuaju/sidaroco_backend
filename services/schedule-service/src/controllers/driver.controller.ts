import { Request, Response } from "express";
import * as DriverService from "../services/driver.service";

const FLEET_SERVICE_URL = process.env.FLEET_SERVICE_URL || "http://fleet-service:3001";
const TICKET_SERVICE_URL = process.env.TICKET_SERVICE_URL || "http://ticket-service:3004";

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    username: string;
    role: string;
  };
}

interface TicketDTO {
  id: number;
  tripId: number;
  userId: string;
  seatNumber: number;
  price: number;
  status: string;
  saleDate: string;
  passengerName: string | null;
  paymentMethod: string | null;
}

async function getDriverIdFromAccountId(
  accountId: string,
  authHeader: string | undefined
): Promise<number | null> {
  try {
    const response = await fetch(`${FLEET_SERVICE_URL}/drivers/byAccount/${accountId}`, {
      headers: authHeader ? { Authorization: authHeader } : {},
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data.id ?? null;
  } catch (error) {
    console.error("Error fetching driver by accountId:", error);
    return null;
  }
}

export async function getMyTrips(req: AuthenticatedRequest, res: Response) {
  try {
    const accountId = req.user?.id;
    if (!accountId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { from, to } = req.query;

    if (!from || !to || typeof from !== "string" || typeof to !== "string") {
      return res.status(400).json({ message: "from and to query params are required (YYYY-MM-DD)" });
    }

    const fromDate = new Date(from);
    const toDate = new Date(to);

    if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) {
      return res.status(400).json({ message: "Invalid date format. Use YYYY-MM-DD" });
    }

    const driverId = await getDriverIdFromAccountId(accountId, req.header("authorization"));
    
    if (!driverId) {
      return res.status(404).json({ message: "Driver profile not found for this account" });
    }

    const trips = await DriverService.getTripsForDriver(driverId, fromDate, toDate);

    res.status(200).json(trips);
  } catch (error) {
    console.error("Error fetching driver trips:", error);
    res.status(500).json({ message: "Failed to fetch trips" });
  }
}

export async function getTripDetail(req: AuthenticatedRequest, res: Response) {
  try {
    const accountId = req.user?.id;
    if (!accountId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const tripId = Number(req.params.tripId);
    if (isNaN(tripId)) {
      return res.status(400).json({ message: "Invalid tripId" });
    }

    const driverId = await getDriverIdFromAccountId(accountId, req.header("authorization"));
    
    if (!driverId) {
      return res.status(404).json({ message: "Driver profile not found for this account" });
    }

    const trip = await DriverService.getTripByIdForDriver(tripId, driverId);

    if (!trip) {
      return res.status(404).json({ message: "Trip not found or not assigned to you" });
    }

    res.status(200).json(trip);
  } catch (error) {
    console.error("Error fetching trip detail:", error);
    res.status(500).json({ message: "Failed to fetch trip" });
  }
}

export async function getTripPassengers(req: AuthenticatedRequest, res: Response) {
  try {
    const accountId = req.user?.id;
    if (!accountId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const tripId = Number(req.params.tripId);
    if (isNaN(tripId)) {
      return res.status(400).json({ message: "Invalid tripId" });
    }

    const driverId = await getDriverIdFromAccountId(accountId, req.header("authorization"));
    
    if (!driverId) {
      return res.status(404).json({ message: "Driver profile not found for this account" });
    }

    const isOwner = await DriverService.verifyTripOwnership(tripId, driverId);
    
    if (!isOwner) {
      return res.status(403).json({ message: "This trip is not assigned to you" });
    }

    const authHeader = req.header("authorization");
    const response = await fetch(`${TICKET_SERVICE_URL}/tickets/trip/${tripId}`, {
      headers: authHeader ? { Authorization: authHeader } : {},
    });

    if (!response.ok) {
      console.error("Error fetching tickets:", response.status);
      return res.status(502).json({ message: "Failed to fetch passengers from ticket service" });
    }

    const tickets: TicketDTO[] = await response.json();

    const passengers = tickets.map((ticket) => ({
      ticketId: ticket.id,
      passengerName: ticket.passengerName || "Sin nombre",
      seatNumber: ticket.seatNumber,
      status: ticket.status,
      paymentMethod: ticket.paymentMethod,
    }));

    res.status(200).json({
      tripId,
      passengerCount: passengers.length,
      passengers,
    });
  } catch (error) {
    console.error("Error fetching trip passengers:", error);
    res.status(500).json({ message: "Failed to fetch passengers" });
  }
}
