import { DailySchedule, ScheduledTrip } from "../generated/prisma/client";
import prisma from "../db/prisma";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/client";


export async function getByDate(date: Date):Promise<DailySchedule | null> {
    return prisma.dailySchedule.findUnique({
        where: {serviceDate: date},
        include: {
            trips: {orderBy: {departureTime: 'asc'}}
        }
    })
}

export async function createSchedule(date: Date):Promise<DailySchedule> {
  try {
    return await prisma.dailySchedule.create({
      data: {
        serviceDate: date,
        duplicatedFrom: null,
      },
    })
  } catch (error) {
    if (
      error instanceof PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      throw new Error("SCHEDULE_ALREADY_EXISTS")
    }

    throw error
  }
}

export async function addTripToSchedule(dailyScheduleId: number, routeId: number, busId: number, driverId: number, departureTime: Date): Promise<ScheduledTrip> {
 try{
    return await prisma.scheduledTrip.create({
        data:{
            dailyScheduleId: dailyScheduleId,
            routeId: routeId,
            busId: busId,
            driverId: driverId
        }
    })
 }
}