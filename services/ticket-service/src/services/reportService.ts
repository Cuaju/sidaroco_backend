import prisma from "../db/prisma";

export async function getTicketsInDateRange(from: Date, to: Date) {
  return prisma.ticket.findMany({
    where: {
      saleDate: { gte: from, lte: to },
    },
    select: {
      price: true,
      tripId: true,
    },
  });
}

export async function getTicketsByTripIds(tripIds: number[], from: Date, to: Date) {
  return prisma.ticket.findMany({
    where: {
      tripId: { in: tripIds },
      saleDate: { gte: from, lte: to },
    },
    select: {
      price: true,
    },
  });
}