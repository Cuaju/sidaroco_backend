import { Router } from "express";
import * as TripController from "../controllers/tripController";

const router = Router();

router.get("/byIds", TripController.getTripsByIds);

export default router;
