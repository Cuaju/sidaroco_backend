import { Trip } from "../generated/prisma/client";
import prisma from "../db/prisma";
//FIXME Implement proper call to Schedule service
const frequentRoutes = new Set<number>([
  1, 2, 61, 62, 63
]);

export function getAvailableSchedules(routeId: number) {
  if (frequentRoutes.has(routeId)) {
    return ["06:00","08:00","10:00","12:00","14:00","16:00","18:00","20:00"];
  }
  return ["07:00","13:00","19:00"];
}

function buildDepartureTime(date: string, hour: string) {
  const [h, m] = hour.split(":").map(Number);
  const d = new Date(date);
  d.setHours(h, m, 0, 0);
  return d;
}

export async function getOrCreateTrip(
  routeId: number,
  date: string,
  hour: string
) {
  const departureTime = buildDepartureTime(date, hour);

  let trip = await prisma.trip.findFirst({
    where: { routeId, departureTime }
  });

  if (!trip) {
    trip = await prisma.trip.create({
      data: {
        routeId,
        departureTime,
        status: "SCHEDULED"
      }
    });
  }

  return trip;
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
