import { Router } from "express";
import * as TicketController from "../controllers/ticketController";
const {Authorize} = require("@sidaroco/auth_middleware")

const router = Router();

router.post("/", Authorize({roles:["Customer", "Cashier"]}), TicketController.createTicket);

router.get("/", Authorize({roles:["Customer", "FinanceManager"]}), TicketController.getAllTickets);

router.get("/user/:userId", Authorize({roles:["Customer"]}), TicketController.getTicketsByUser);

router.get("/:id", Authorize({roles:["Customer", "FinanceManager"]}), TicketController.getTicketById);

router.put("/:id", Authorize({roles:["Cashier"]}), TicketController.updateTicket);

router.delete("/:id", Authorize({roles:["Customer", "Cashier"]}), TicketController.deleteTicket);

router.post("/send-email", Authorize({roles:["Customer", "Cashier"]}), TicketController.sendTicketsEmail);

router.options("/user/:userId", (_req, res) => {
  res.sendStatus(204);
});

export default router;