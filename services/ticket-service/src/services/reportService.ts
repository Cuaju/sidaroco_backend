import prisma from "../db/prisma";

async function getScheduleRange(from: Date, to: Date, authHeader?: string) {
  const baseUrl = process.env.SCHEDULE_SERVICE_URL!;
  const url =
  `${baseUrl}/schedule/range` +
  `?from=${toLocalDateString(from)}` +
  `&to=${toLocalDateString(to)}`;

  const res = await fetch(url, {
    headers: authHeader ? { Authorization: authHeader } : {},
  });

  if (!res.ok) {
    throw new Error("SCHEDULE_SERVICE_ERROR");
  }

  return res.json();
}

function toLocalDateString(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}


export async function getDailyTicketReport(date: Date, authHeader?: string) {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);

  const end = new Date(date);
  end.setHours(23, 59, 59, 999);

  const tickets = await prisma.ticket.findMany({
    where: { saleDate: { gte: start, lte: end } },
    select: { price: true, tripId: true },
  });

  const schedules = await getScheduleRange(start, end, authHeader);

  const tripToRoute = new Map<number, number>();
  for (const s of schedules) {
    for (const t of s.trips) {
      tripToRoute.set(t.id, t.routeId);
    }
  }

  const byRoute: Record<number, { tickets: number; income: number }> = {};

  for (const t of tickets) {
    const routeId = tripToRoute.get(t.tripId);
    if (routeId === undefined) continue;

    if (!byRoute[routeId]) {
      byRoute[routeId] = { tickets: 0, income: 0 };
    }

    byRoute[routeId].tickets += 1;
    byRoute[routeId].income += t.price;
  }

  return {
    date,
    totalTickets: tickets.length,
    totalIncome: tickets.reduce((s, t) => s + t.price, 0),
    byRoute,
  };
}

export async function getMonthlyEarningsReport(
  year: number,
  month: number,
  authHeader?: string
) {
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0, 23, 59, 59, 999);

  const tickets = await prisma.ticket.findMany({
    where: { saleDate: { gte: start, lte: end } },
    select: { price: true, tripId: true },
  });

  const schedules = await getScheduleRange(start, end, authHeader);

  const tripToRoute = new Map<number, number>();
  for (const s of schedules) {
    for (const t of s.trips) {
      tripToRoute.set(t.id, t.routeId);
    }
  }

  const byRoute: Record<number, { tickets: number; income: number }> = {};

  for (const t of tickets) {
    const routeId = tripToRoute.get(t.tripId);
    if (routeId === undefined) continue;

    if (!byRoute[routeId]) {
      byRoute[routeId] = { tickets: 0, income: 0 };
    }

    byRoute[routeId].tickets += 1;
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
  routeId: number,
  authHeader?: string
) {
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0, 23, 59, 59, 999);

  const schedules = await getScheduleRange(start, end, authHeader);

  const tripIds: number[] = [];
  for (const s of schedules) {
    for (const t of s.trips) {
      if (t.routeId === routeId) {
        tripIds.push(t.id);
      }
    }
  }

  const tickets = await prisma.ticket.findMany({
    where: {
      tripId: { in: tripIds },
      saleDate: { gte: start, lte: end },
    },
    select: { price: true },
  });

  return {
    year,
    month,
    routeId,
    totalTickets: tickets.length,
    totalIncome: tickets.reduce((s, t) => s + t.price, 0),
  };
}