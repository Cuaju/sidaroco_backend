import { Router } from "express";
import * as ReportController from "../controllers/reportController";
const { Authorize } = require ("@sidaroco/auth_middleware");

const router = Router();

router.get("/tickets/daily", Authorize({roles:["FinanceManager"]}), ReportController.getDailyTicketReport);
router.get("/earnings/monthly", Authorize({roles:["FinanceManager"]}),ReportController.getMonthlyEarningsReport);
router.get("/earnings/monthly/by-route",Authorize({roles:["FinanceManager"]}),ReportController.getMonthlyRouteReport);

export default router;
