import { Request, Response } from "express";
import * as ScheduleService from "../services/schedule.service";

export async function createEmptySchedule(req: Request, res: Response) {
  try {
    const rawDate = req.body.date;

    let date: Date;

    if (!rawDate) {
      date = new Date();
    } else {
      date = new Date(rawDate);
    }

    if (isNaN(date.getTime())) {
      return res.status(400).json({
        message: "Invalid date format. Use YYYY-MM-DD",
      });
    }

    const schedule = await ScheduleService.createSchedule(date);

    res.status(201).json(schedule);
  } catch (error) {
    if (error instanceof Error && error.message === "SCHEDULE_ALREADY_EXISTS") {
      return res.status(409).json({
        message: "Schedule for this date already exists",
      });
    }

    console.error("Error creating empty schedule:", error);
    res.status(500).json({ message: "Failed to create empty schedule" });
  }
}

export async function getScheduleForDay(req: Request, res: Response) {
  try {
    const rawDate = req.params.date;
    const date = new Date(rawDate);

    if (isNaN(date.getTime())) {
      return res.status(400).json({
        message: "Invalid date format. Use YYYY-MM-DD",
      });
    }

    const schedule = await ScheduleService.getByDate(date);

    if (!schedule) {
      return res.status(404).json({
        message: "Schedule not found",
      });
    }

    res.status(200).json(schedule);
  } catch (error) {
    console.error("Error fetching schedule:", error);
    res.status(500).json({ message: "Failed to fetch schedule" });
  }
}

export async function addTripToSchedule(req: Request, res: Response){
    try{



    }catch(error){
        console.error("Error creating trip: ", error)
        res.status(500).json({message: "Failed to create trip for this date"})
    }
}