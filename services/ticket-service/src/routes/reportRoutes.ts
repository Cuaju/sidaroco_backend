import { Router } from "express";
import * as ReportController from "../controllers/reportController";

const router = Router();

router.get("/tickets/daily", ReportController.getDailyTicketReport);
router.get("/earnings/monthly", ReportController.getMonthlyEarningsReport);
router.get("/earnings/monthly/by-route",ReportController.getMonthlyRouteReport);

export default router;
