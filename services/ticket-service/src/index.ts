import "dotenv/config";
import express from "express";
import ticketRoutes from "./routes/ticketRoutes";
import reportRoutes from "./routes/reportRoutes";
import tripRoutes from "./routes/tripRoutes";

const app = express();

app.use(express.json());

app.use("/tickets", ticketRoutes);
app.use("/reports", reportRoutes);
app.use("/trips", tripRoutes);

const PORT = process.env.TICKET_SERVICE_PORT || 3004;

app.listen(PORT, () =>
  console.log(`Ticket Service running on port ${PORT}`)
);
