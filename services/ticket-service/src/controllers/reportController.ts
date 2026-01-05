import { Request, Response } from "express";
import * as ReportService from "../services/reportService";

export async function getDailyTicketReport(req: Request, res: Response) {
  const { date } = req.query;

  if (typeof date !== "string") {
    return res.status(400).json({ message: "Invalid date" });
  }

  const d = new Date(date);
  if (isNaN(d.getTime())) {
    return res.status(400).json({ message: "Invalid date format" });
  }

  const report = await ReportService.getDailyTicketReport(
    d,
    req.header("authorization") ?? undefined
  );

  res.json(report);
}

export async function getMonthlyEarningsReport(req: Request, res: Response) {
  const { year, month } = req.query;

  if (!year || !month) {
    return res.status(400).json({ message: "Year and month required" });
  }

  const report = await ReportService.getMonthlyEarningsReport(
    Number(year),
    Number(month),
    req.header("authorization") ?? undefined
  );

  res.json(report);
}

export async function getMonthlyRouteReport(req: Request, res: Response) {
  const { year, month, routeId } = req.query;

  if (!year || !month || !routeId) {
    return res.status(400).json({ message: "Year, month and routeId required" });
  }

  const report = await ReportService.getMonthlyRouteReport(
    Number(year),
    Number(month),
    Number(routeId),
    req.header("authorization") ?? undefined
  );

  res.json(report);
}
