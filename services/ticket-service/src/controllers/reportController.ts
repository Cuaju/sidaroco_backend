import { Request, Response } from "express";
import * as ReportService from "../services/reportService";
import { scheduleGetTripsInRange, scheduleGetTripsByIds } from "../utils/scheduleClient";

function parseUTCDate(dateString: string): Date {
  return new Date(`${dateString}T00:00:00.000Z`);
}

export async function getDailyTicketReport(req: Request, res: Response) {
  try {
    const { date } = req.query;

    if (typeof date !== "string") {
      return res.status(400).json({ message: "Invalid date" });
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({ message: "Invalid date format. Use YYYY-MM-DD" });
    }

    const authHeader = req.header("authorization");
    if (!authHeader) {
      return res.status(401).json({ message: "Authorization header required" });
    }

    const d = parseUTCDate(date);
    if (isNaN(d.getTime())) {
      return res.status(400).json({ message: "Invalid date" });
    }

    const start = new Date(d);
    start.setUTCHours(0, 0, 0, 0);
    const end = new Date(d);
    end.setUTCHours(23, 59, 59, 999);

    console.log("Date range:", { start, end, dateString: date });

    const tickets = await ReportService.getTicketsInDateRange(start, end);
    console.log("Tickets found:", tickets.length);

    // Get unique trip IDs from tickets and fetch their route info
    const tripIds = [...new Set(tickets.map((t) => t.tripId))];
    console.log("Unique trip IDs:", tripIds);

    const scheduleTrips = await scheduleGetTripsByIds(tripIds, authHeader);
    console.log("Schedule trips found:", scheduleTrips.length);

    const tripToRoute = new Map<number, number>();
    for (const trip of scheduleTrips) {
      tripToRoute.set(trip.tripId, trip.routeId);
    }

    const byRoute: Record<number, { tickets: number; income: number }> = {};
    for (const ticket of tickets) {
      const routeId = tripToRoute.get(ticket.tripId);
      if (routeId === undefined) {
        console.log("Trip not found in schedule:", ticket.tripId); 
        continue;
      }

      if (!byRoute[routeId]) {
        byRoute[routeId] = { tickets: 0, income: 0 };
      }
      byRoute[routeId].tickets += 1;
      byRoute[routeId].income += ticket.price;
    }

    const totalTickets = tickets.length;
    const totalIncome = tickets.reduce((sum, t) => sum + t.price, 0);

    res.json({
      date: d,
      totalTickets,
      totalIncome,
      byRoute,
    });
  } catch (error) {
    console.error("Error in getDailyTicketReport:", error);
    res.status(500).json({
      message: error instanceof Error ? error.message : "Failed to generate daily report",
    });
  }
}

export async function getMonthlyEarningsReport(req: Request, res: Response) {
  try {
    const { year, month } = req.query;

    if (!year || !month) {
      return res.status(400).json({ message: "Year and month required" });
    }

    const authHeader = req.header("authorization");
    if (!authHeader) {
      return res.status(401).json({ message: "Authorization header required" });
    }

    const y = Number(year);
    const m = Number(month);

    const start = new Date(y, m - 1, 1);
    const end = new Date(y, m, 0, 23, 59, 59, 999);

    const tickets = await ReportService.getTicketsInDateRange(start, end);

    // Get unique trip IDs from tickets and fetch their route info
    const tripIds = [...new Set(tickets.map((t) => t.tripId))];
    const scheduleTrips = await scheduleGetTripsByIds(tripIds, authHeader);

    const tripToRoute = new Map<number, number>();
    for (const trip of scheduleTrips) {
      tripToRoute.set(trip.tripId, trip.routeId);
    }

    const byRoute: Record<number, { tickets: number; income: number }> = {};
    for (const ticket of tickets) {
      const routeId = tripToRoute.get(ticket.tripId);
      if (routeId === undefined) continue;

      if (!byRoute[routeId]) {
        byRoute[routeId] = { tickets: 0, income: 0 };
      }
      byRoute[routeId].tickets += 1;
      byRoute[routeId].income += ticket.price;
    }

    const totalTickets = tickets.length;
    const totalIncome = tickets.reduce((sum, t) => sum + t.price, 0);

    res.json({
      year: y,
      month: m,
      totalTickets,
      totalIncome,
      byRoute,
    });
  } catch (error) {
    console.error("Error in getMonthlyEarningsReport:", error);
    res.status(500).json({
      message: error instanceof Error ? error.message : "Failed to generate monthly report",
    });
  }
}

export async function getMonthlyRouteReport(req: Request, res: Response) {
  try {
    const { year, month, routeId } = req.query;

    if (!year || !month || !routeId) {
      return res.status(400).json({ message: "Year, month and routeId required" });
    }

    const authHeader = req.header("authorization");
    if (!authHeader) {
      return res.status(401).json({ message: "Authorization header required" });
    }

    const y = Number(year);
    const m = Number(month);
    const rId = Number(routeId);

    const start = new Date(y, m - 1, 1);
    const end = new Date(y, m, 0, 23, 59, 59, 999);

    const scheduleTrips = await scheduleGetTripsInRange(start, end, authHeader);

    const tripIds: number[] = [];
    for (const trip of scheduleTrips) {
      if (trip.routeId === rId) {
        tripIds.push(trip.tripId);
      }
    }

    const tickets = await ReportService.getTicketsByTripIds(tripIds, start, end);

    const totalTickets = tickets.length;
    const totalIncome = tickets.reduce((sum, t) => sum + t.price, 0);

    res.json({
      year: y,
      month: m,
      routeId: rId,
      totalTickets,
      totalIncome,
    });
  } catch (error) {
    console.error("Error in getMonthlyRouteReport:", error);
    res.status(500).json({
      message: error instanceof Error ? error.message : "Failed to generate route report",
    });
  }
}