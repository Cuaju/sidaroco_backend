import prisma from "../db/prisma";

export async function getDailyTicketReport(date: Date) {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);

  const end = new Date(date);
  end.setHours(23, 59, 59, 999);

  const tickets = await prisma.ticket.findMany({
    where: {
      saleDate: { gte: start, lte: end },
    },
  });

  const trips = await prisma.trip.findMany();
  const tripToRoute = new Map(trips.map(t => [t.id, t.routeId]));

  const byRoute: Record<number, { tickets: number; income: number }> = {};

  for (const t of tickets) {
    const routeId = tripToRoute.get(t.tripId);
    if (routeId === undefined) continue;

    if (!byRoute[routeId]) {
      byRoute[routeId] = { tickets: 0, income: 0 };
    }

    byRoute[routeId].tickets++;
    byRoute[routeId].income += t.price;
  }

  return {
    date,
    totalTickets: tickets.length,
    totalIncome: tickets.reduce((s, t) => s + t.price, 0),
    byRoute,
  };
}

export async function getMonthlyEarningsReport(year: number, month: number) {
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0, 23, 59, 59, 999);

  const tickets = await prisma.ticket.findMany({
    where: {
      saleDate: { gte: start, lte: end },
    },
  });

  const trips = await prisma.trip.findMany();
  const tripToRoute = new Map(trips.map(t => [t.id, t.routeId]));

  const byRoute: Record<number, { tickets: number; income: number }> = {};

  for (const t of tickets) {
    const routeId = tripToRoute.get(t.tripId);
    if (routeId === undefined) continue;

    if (!byRoute[routeId]) {
      byRoute[routeId] = { tickets: 0, income: 0 };
    }

    byRoute[routeId].tickets++;
    byRoute[routeId].income += t.price;
  }

  return {
    year,
    month,
    totalTickets: tickets.length,
    totalIncome: tickets.reduce((s, t) => s + t.price, 0),
    byRoute,
  };
}

export async function getMonthlyRouteReport(
  year: number,
  month: number,
  routeId: number
) {
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0, 23, 59, 59, 999);

  const trips = await prisma.trip.findMany({
    where: { routeId },
    select: { id: true },
  });

  const tripIds = trips.map(t => t.id);

  const tickets = await prisma.ticket.findMany({
    where: {
      tripId: { in: tripIds },
      saleDate: { gte: start, lte: end },
    },
  });

  return {
    year,
    month,
    routeId,
    totalTickets: tickets.length,
    totalIncome: tickets.reduce((s, t) => s + t.price, 0),
  };
}