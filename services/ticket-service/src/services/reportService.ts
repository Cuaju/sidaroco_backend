import prisma from "../db/prisma";

export async function getDailyTicketReport(date: Date) {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);

  const end = new Date(date);
  end.setHours(23, 59, 59, 999);

  const tickets = await prisma.ticket.findMany({
    where: {
      saleDate: {
        gte: start,
        lte: end
      }
    }
  });

  const byRoute: Record<number, { tickets: number; income: number }> = {};

  for (const t of tickets) {
    if (!byRoute[t.routeId]) {
      byRoute[t.routeId] = { tickets: 0, income: 0 };
    }
    byRoute[t.routeId].tickets++;
    byRoute[t.routeId].income += t.price;
  }

  return {
    date,
    totalTickets: tickets.length,
    totalIncome: tickets.reduce((s, t) => s + t.price, 0),
    byRoute
  };
}

export async function getMonthlyEarningsReport(year: number, month: number) {
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0, 23, 59, 59, 999);

  const tickets = await prisma.ticket.findMany({
    where: {
      saleDate: {
        gte: start,
        lte: end
      }
    }
  });

  const byRoute: Record<number, { tickets: number; income: number }> = {};

  for (const t of tickets) {
    if (!byRoute[t.routeId]) {
      byRoute[t.routeId] = { tickets: 0, income: 0 };
    }
    byRoute[t.routeId].tickets++;
    byRoute[t.routeId].income += t.price;
  }

  return {
    year,
    month,
    totalTickets: tickets.length,
    totalIncome: tickets.reduce((s, t) => s + t.price, 0),
    byRoute
  };
}
