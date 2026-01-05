import { Router } from "express";
import * as ReportController from "../controllers/reportController";
const { Authorize } = require ("@sidaroco/auth_middleware");

const router = Router();

router.get("/tickets/daily", Authorize(), ReportController.getDailyTicketReport);
router.get("/earnings/monthly", ReportController.getMonthlyEarningsReport);
router.get("/earnings/monthly/by-route",ReportController.getMonthlyRouteReport);

export default router;
