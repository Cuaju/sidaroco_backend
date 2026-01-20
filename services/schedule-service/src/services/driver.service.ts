import prisma from "../db/prisma";

export interface DriverTrip {
  id: number;
  serviceDate: string; // YYYY-MM-DD
  departureTimeHHmm: string; // HH:mm
  departureKey: string; // YYYY-MM-DDTHH:mm for easy sorting
  routeId: number;
  busId: number;
  driverId: number;
  status: string;
}

function formatTimeHHmm(date: Date): string {
  const hours = date.getUTCHours().toString().padStart(2, "0");
  const minutes = date.getUTCMinutes().toString().padStart(2, "0");
  return `${hours}:${minutes}`;
}

function formatDateYYYYMMDD(date: Date): string {
  return date.toISOString().split("T")[0];
}

export async function getTripsForDriver(
  driverId: number,
  fromDate: Date,
  toDate: Date
): Promise<DriverTrip[]> {
  const schedules = await prisma.dailySchedule.findMany({
    where: {
      serviceDate: {
        gte: fromDate,
        lte: toDate,
      },
    },
    include: {
      trips: {
        where: {
          driverId: driverId,
        },
        orderBy: {
          departureTime: "asc",
        },
      },
    },
    orderBy: {
      serviceDate: "asc",
    },
  });

  const result: DriverTrip[] = [];

  for (const schedule of schedules) {
    const serviceDate = formatDateYYYYMMDD(schedule.serviceDate);

    for (const trip of schedule.trips) {
      const departureTimeHHmm = formatTimeHHmm(trip.departureTime);
      
      result.push({
        id: trip.id,
        serviceDate,
        departureTimeHHmm,
        departureKey: `${serviceDate}T${departureTimeHHmm}`,
        routeId: trip.routeId,
        busId: trip.busId,
        driverId: trip.driverId,
        status: trip.status,
      });
    }
  }

  return result;
}

export async function getTripByIdForDriver(
  tripId: number,
  driverId: number
): Promise<DriverTrip | null> {
  const trip = await prisma.scheduledTrip.findUnique({
    where: { id: tripId },
    include: {
      dailySchedule: true,
    },
  });

  if (!trip || trip.driverId !== driverId) {
    return null;
  }

  const serviceDate = formatDateYYYYMMDD(trip.dailySchedule.serviceDate);
  const departureTimeHHmm = formatTimeHHmm(trip.departureTime);

  return {
    id: trip.id,
    serviceDate,
    departureTimeHHmm,
    departureKey: `${serviceDate}T${departureTimeHHmm}`,
    routeId: trip.routeId,
    busId: trip.busId,
    driverId: trip.driverId,
    status: trip.status,
  };
}

export async function verifyTripOwnership(
  tripId: number,
  driverId: number
): Promise<boolean> {
  const trip = await prisma.scheduledTrip.findUnique({
    where: { id: tripId },
    select: { driverId: true },
  });

  return trip?.driverId === driverId;
}
