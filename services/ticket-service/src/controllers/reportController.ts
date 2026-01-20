import { Request, Response } from "express";
import * as ReportService from "../services/reportService";
import { scheduleGetTripsInRange, scheduleGetTripsByIds } from "../utils/scheduleClient";

const usersBaseUrl =
  process.env.USERS_SERVICE_URL || "http://localhost:3005";
  
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

type CashierAccount = {
  id: string;
  fullName: string;
};

type UsersResponse = {
  accounts: {
    id: string;
    userType: string;
    profile?: {
      fullName?: string;
    };
  }[];
};

type DailyCutTicket = {
  id: number;
  userId: string;
  price: number;
  paymentMethod: string | null;
  amountReceived: number | null;
  changeGiven: number | null;
  cardLast4: string | null;
};

export async function getDailyCashierCut(req: Request, res: Response) {
  try {
    const { date } = req.query;

    if (typeof date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
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

    const usersResponse = await fetch(`${usersBaseUrl}/api/users/admin/accounts`, {
      headers: { authorization: authHeader },
    });

    if (!usersResponse.ok) {
      return res.status(502).json({ message: "Users service error" });
    }

    const usersData: UsersResponse = await usersResponse.json();

    const cashiers: CashierAccount[] = usersData.accounts
      .filter((a) => a.userType === "Cashier")
      .map((a) => ({
        id: a.id,
        fullName: a.profile?.fullName ?? "Unknown",
      }));

    const cashierIds = cashiers.map((c) => c.id);
    const tickets = await ReportService.getTicketsForDailyCut(cashierIds, start, end) as unknown as DailyCutTicket[];

    const result: {
      cashierId: string;
      cashierName: string;
      totalTickets: number;
      totalIncome: number;
      byPaymentMethod: {
        CASH?: {
          tickets: number;
          total: number;
          amountReceived: number;
          changeGiven: number;
        };
        CARD?: {
          tickets: number;
          total: number;
          transactions: { ticketId: number; last4: string | null; amount: number }[];
        };
      };
    }[] = [];

    for (const cashier of cashiers) {
      const cashierTickets = tickets.filter((t) => t.userId === cashier.id);
      
      if (cashierTickets.length === 0) continue;

      const cashData = {
        tickets: 0,
        total: 0,
        amountReceived: 0,
        changeGiven: 0,
      };

      const cardData: {
        tickets: number;
        total: number;
        transactions: { ticketId: number; last4: string | null; amount: number }[];
      } = {
        tickets: 0,
        total: 0,
        transactions: [],
      };

      for (const ticket of cashierTickets) {
        if (ticket.paymentMethod === "CASH") {
          cashData.tickets += 1;
          cashData.total += ticket.price;
          cashData.amountReceived += ticket.amountReceived ?? ticket.price;
          cashData.changeGiven += ticket.changeGiven ?? 0;
        } else if (ticket.paymentMethod === "CARD") {
          cardData.tickets += 1;
          cardData.total += ticket.price;
          cardData.transactions.push({
            ticketId: ticket.id,
            last4: ticket.cardLast4,
            amount: ticket.price,
          });
        }
      }

      const byPaymentMethod: typeof result[number]["byPaymentMethod"] = {};
      if (cashData.tickets > 0) byPaymentMethod.CASH = cashData;
      if (cardData.tickets > 0) byPaymentMethod.CARD = cardData;

      result.push({
        cashierId: cashier.id,
        cashierName: cashier.fullName,
        totalTickets: cashierTickets.length,
        totalIncome: cashierTickets.reduce((sum, t) => sum + t.price, 0),
        byPaymentMethod,
      });
    }

    res.json({
      date,
      cashiers: result,
    });
  } catch (error) {
    console.error("Error in getDailyCashierCut:", error);
    res.status(500).json({
      message: error instanceof Error ? error.message : "Failed to generate daily cut report",
    });
  }
}

export async function getMonthlyCashierSummary(req: Request, res: Response) {
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

    const usersResponse = await fetch(
      `${usersBaseUrl}/api/users/admin/accounts`,
      {
        headers: {
          authorization: authHeader,
        },
      }
    );

    if (!usersResponse.ok) {
      return res.status(502).json({ message: "Users service error" });
    }

    const usersData: UsersResponse = await usersResponse.json();

    const cashiers: CashierAccount[] = usersData.accounts
      .filter((a) => a.userType === "Cashier")
      .map((a) => ({
        id: a.id,
        fullName: a.profile?.fullName ?? "Unknown",
      }));

    const cashierIds: string[] = cashiers.map((c) => c.id);

    const tickets = await ReportService.getTicketsByUsersInDateRange(
      cashierIds,
      start,
      end
    );

    const result = new Map<
      string,
      { cashierId: string; fullName: string; tickets: number; total: number }
    >();

    for (const t of tickets) {
      const cashier = cashiers.find((c) => c.id === t.userId);
      if (!cashier) continue;

      if (!result.has(cashier.id)) {
        result.set(cashier.id, {
          cashierId: cashier.id,
          fullName: cashier.fullName,
          tickets: 0,
          total: 0,
        });
      }

      const acc = result.get(cashier.id)!;
      acc.tickets += 1;
      acc.total += t.price;
    }

    res.json({
      year: y,
      month: m,
      cashiers: Array.from(result.values()),
    });
  } catch (error) {
    res.status(500).json({
      message:
        error instanceof Error
          ? error.message
          : "Failed to generate cashier report",
    });
  }
}

