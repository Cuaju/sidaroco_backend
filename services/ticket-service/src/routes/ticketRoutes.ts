import { Router } from "express";
import * as TicketController from "../controllers/ticketController";

const router = Router();

router.post("/", TicketController.createTicket);
router.get("/", TicketController.getAllTickets);

router.get("/user/:userId", TicketController.getTicketsByUser);

router.get("/:id", TicketController.getTicketById);

router.put("/:id", TicketController.updateTicket);
router.delete("/:id", TicketController.deleteTicket);

router.options("/user/:userId", (_req, res) => {
  res.sendStatus(204);
});

export default router;