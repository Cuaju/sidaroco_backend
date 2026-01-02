import { Trip } from "../generated/prisma/client";
import prisma from "../db/prisma";

function buildDepartureTime(date: string, hour: string) {
  const [h, m] = hour.split(":").map(Number);
  const d = new Date(date);
  d.setHours(h, m, 0, 0);
  return d;
}

export async function getTrips(
  tripIds: number[]
): Promise<Pick<Trip, "id" | "routeId" | "departureTime">[]> {
  return prisma.trip.findMany({
    where: {
      id: {
        in: tripIds
      }
    },
    select: {
      id: true,
      routeId: true,
      departureTime: true
    }
  });
}

export function getTripsByRoute(routeId: number, date: Date) {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);

  const end = new Date(date);
  end.setHours(23, 59, 59, 999);

  return prisma.trip.findMany({
    where: {
      routeId,
      status: "SCHEDULED",
      departureTime: {
        gte: start,
        lte: end
      }
    },
    orderBy: {
      departureTime: "asc"
    }
  });
}

export function getTicketsByTrip(tripId: number) {
  return prisma.ticket.findMany({
    where: {
      tripId
    }
  });
}
