import { DailySchedule, ScheduledTrip } from "../generated/prisma/client";
import prisma from "../db/prisma";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/client";


export async function getScheduleByDate(date: Date): Promise<DailySchedule | null> {
  return prisma.dailySchedule.findUnique({
    where: { serviceDate: date },
    include: {
      trips: { orderBy: { departureTime: "asc" } },
    },
  });
}

export async function getScheduleById(id: number): Promise<DailySchedule | null> {
  return prisma.dailySchedule.findUnique({
    where: { id },
    include: {
      trips: { orderBy: { departureTime: "asc" } },
    },
  });
}

export async function getAllSchedules(): Promise<DailySchedule[]> {
  return prisma.dailySchedule.findMany({
    include: {
      trips: { orderBy: { departureTime: "asc" } },
    },
    orderBy: { serviceDate: "desc" },
  });
}

export async function createSchedule(
  data: Omit<DailySchedule, "id" | "createdAt" | "updatedAt" | "isLocked">
): Promise<DailySchedule> {
  try {
    return await prisma.dailySchedule.create({
      data: {
        serviceDate: data.serviceDate,
        duplicatedFrom: data.duplicatedFrom,
      },
    });
  } catch (error) {
    if (
      error instanceof PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      throw new Error("SCHEDULE_ALREADY_EXISTS");
    }
    throw error;
  }
}

export async function updateSchedule(
  id: number,
  data: Partial<Omit<DailySchedule, "id" | "createdAt" | "updatedAt">>
): Promise<DailySchedule> {
  return prisma.dailySchedule.update({
    where: { id },
    data,
  });
}

export async function deleteSchedule(id: number): Promise<DailySchedule> {
  return prisma.dailySchedule.delete({
    where: { id },
  });
}

export async function lockSchedule(id: number): Promise<DailySchedule> {
  return prisma.dailySchedule.update({
    where: { id },
    data: { isLocked: true },
  });
}

export async function unlockSchedule(id: number): Promise<DailySchedule> {
  return prisma.dailySchedule.update({
    where: { id },
    data: { isLocked: false },
  });
}

export async function createTrip(
  data: Omit<ScheduledTrip, "id" | "createdAt" | "updatedAt" | "status">
): Promise<ScheduledTrip> {
  return prisma.scheduledTrip.create({
    data,
  });
}

export async function getTripById(id: number): Promise<ScheduledTrip | null> {
  return prisma.scheduledTrip.findUnique({
    where: { id },
  });
}

export async function getTripsByScheduleId(dailyScheduleId: number): Promise<ScheduledTrip[]> {
  return prisma.scheduledTrip.findMany({
    where: { dailyScheduleId },
    orderBy: { departureTime: "asc" },
  });
}

export async function updateTrip(
  id: number,
  data: Partial<Omit<ScheduledTrip, "id" | "createdAt" | "updatedAt">>
): Promise<ScheduledTrip> {
  return prisma.scheduledTrip.update({
    where: { id },
    data,
  });
}

export async function deleteTrip(id: number): Promise<ScheduledTrip> {
  return prisma.scheduledTrip.delete({
    where: { id },
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Composite Operations
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Adds a trip to a schedule for a given date.
 * Creates the DailySchedule if it doesn't exist.
 */
export async function addTripToSchedule(data: {
  date: Date;
  routeId: number;
  busId: number;
  driverId: number;
  departureTime: Date;
}): Promise<ScheduledTrip> {
  let schedule = await prisma.dailySchedule.findUnique({
    where: { serviceDate: data.date },
  });

  if (!schedule) {
    schedule = await prisma.dailySchedule.create({
      data: {
        serviceDate: data.date,
        duplicatedFrom: null,
      },
    });
  }

  if (schedule.isLocked) {
    throw new Error("SCHEDULE_IS_LOCKED");
  }

  return prisma.scheduledTrip.create({
    data: {
      dailyScheduleId: schedule.id,
      routeId: data.routeId,
      busId: data.busId,
      driverId: data.driverId,
      departureTime: data.departureTime,
    },
  });
}


export async function duplicateSchedule(
  sourceDate: Date,
  targetDate: Date
): Promise<DailySchedule> {
  const sourceSchedule = await prisma.dailySchedule.findUnique({
    where: { serviceDate: sourceDate },
    include: { trips: true },
  });

  if (!sourceSchedule) {
    throw new Error("SOURCE_SCHEDULE_NOT_FOUND");
  }

  // Check if target date already has a schedule
  const existingTarget = await prisma.dailySchedule.findUnique({
    where: { serviceDate: targetDate },
  });

  if (existingTarget) {
    throw new Error("TARGET_SCHEDULE_ALREADY_EXISTS");
  }

  // Create new schedule with trips in a transaction
  return prisma.$transaction(async (tx) => {
    const newSchedule = await tx.dailySchedule.create({
      data: {
        serviceDate: targetDate,
        duplicatedFrom: sourceDate,
      },
    });

    if (sourceSchedule.trips.length > 0) {
      await tx.scheduledTrip.createMany({
        data: sourceSchedule.trips.map((trip) => ({
          dailyScheduleId: newSchedule.id,
          routeId: trip.routeId,
          busId: trip.busId,
          driverId: trip.driverId,
          departureTime: trip.departureTime,
        })),
      });
    }

    return tx.dailySchedule.findUnique({
      where: { id: newSchedule.id },
      include: { trips: { orderBy: { departureTime: "asc" } } },
    }) as Promise<DailySchedule>;
  });
}

// Alias for backward compatibility
export const getByDate = getScheduleByDate;

// ─────────────────────────────────────────────────────────────────────────────
// Summary & Range Queries
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Returns a summary of all schedules with trip counts.
 */
export async function getSummary(): Promise<
  { date: string; tripCount: number; isLocked: boolean }[]
> {
  const schedules = await prisma.dailySchedule.findMany({
    include: {
      _count: { select: { trips: true } },
    },
    orderBy: { serviceDate: "asc" },
  });

  return schedules.map((s) => ({
    date: s.serviceDate.toISOString().split("T")[0],
    tripCount: s._count.trips,
    isLocked: s.isLocked,
  }));
}

/**
 * Returns schedules within a date range with trip counts.
 */
export async function getSchedulesInRange(
  from: Date,
  to: Date
): Promise<{ serviceDate: string; tripCount: number; isLocked: boolean }[]> {
  const schedules = await prisma.dailySchedule.findMany({
    where: {
      serviceDate: {
        gte: from,
        lte: to,
      },
    },
    include: {
      _count: { select: { trips: true } },
    },
    orderBy: { serviceDate: "asc" },
  });

  return schedules.map((s) => ({
    serviceDate: s.serviceDate.toISOString().split("T")[0],
    tripCount: s._count.trips,
    isLocked: s.isLocked,
  }));
}

export async function getTripIdsInRange(
  from: Date,
  to: Date
): Promise<
  {
    tripId: number;
    routeId: number;
    serviceDate: string;
  }[]
> {
  const fromDate = new Date(from);
  fromDate.setUTCHours(0, 0, 0, 0);
  
  const toDate = new Date(to);
  toDate.setUTCHours(23, 59, 59, 999);

  console.log("Schedule Service - Adjusted range:", { 
    from: fromDate.toISOString(), 
    to: toDate.toISOString() 
  });

  const trips = await prisma.scheduledTrip.findMany({
    where: {
      dailySchedule: {
        serviceDate: {
          gte: fromDate,
          lte: toDate,
        },
      },
    },
    select: {
      id: true,
      routeId: true,
      dailySchedule: {
        select: {
          serviceDate: true,
        },
      },
    },
    orderBy: {
      dailySchedule: { serviceDate: "asc" },
    },
  });

  console.log("Schedule Service - Trips found:", trips.length);
  if (trips.length > 0) {
    console.log("Sample trips:", trips.slice(0, 2).map(t => ({
      id: t.id,
      routeId: t.routeId,
      serviceDate: t.dailySchedule.serviceDate
    })));
  }

  return trips.map(t => ({
    tripId: t.id,
    routeId: t.routeId,
    serviceDate: t.dailySchedule.serviceDate
      .toISOString()
      .split("T")[0],
  }));
}