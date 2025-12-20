import { Request, Response } from "express";
import * as ReportService from "../services/reportService";

export async function getDailyTicketReport(req: Request, res: Response) {
  const { date } = req.query;

  if (!date || isNaN(Date.parse(date as string))) {
    return res.status(400).json({ message: "Invalid date" });
  }

  const report = await ReportService.getDailyTicketReport(new Date(date as string));
  res.json(report);
}

export async function getMonthlyEarningsReport(req: Request, res: Response) {
  const { year, month } = req.query;

  if (!year || !month) {
    return res.status(400).json({ message: "Year and month required" });
  }

  const report = await ReportService.getMonthlyEarningsReport(
    Number(year),
    Number(month)
  );

  res.json(report);
}
