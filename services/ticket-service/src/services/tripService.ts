import { Trip } from "../generated/prisma/client";
import prisma from "../db/prisma";

export async function getTrips(
  tripIds: number[]
): Promise<Pick<Trip, "id" | "routeId" | "departureTime">[]> {
  return prisma.trip.findMany({
    where: {
      id: {
        in: tripIds,
      },
    },
    select: {
      id: true,
      routeId: true,
      departureTime: true,
    },
  });
}
