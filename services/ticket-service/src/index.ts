import "dotenv/config";
import express from "express";
import ticketRoutes from "./routes/ticketRoutes";
import reportRoutes from "./routes/reportRoutes";

const app = express();
app.use(express.json());

app.use("/tickets", ticketRoutes);
app.use("/reports", reportRoutes);

const PORT = process.env.TICKET_SERVICE_PORT || 3001;

app.listen(PORT, () =>
  console.log(`Ticket Service running on port ${PORT}`)
);
