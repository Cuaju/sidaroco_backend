import "dotenv/config";
import express from "express";
import ticketRoutes from "./routes/ticketRoutes";
import reportRoutes from "./routes/reportRoutes";
import tripRoutes from "./routes/tripRoutes";
import cors from "cors";

const app = express();

const corsURL =  String(process.env.CORS_DOMAIN || "http://localhost:5173");

app.use(cors({
  origin: [corsURL], 
  credentials: true
}));

app.use(express.json());

app.use("/tickets", ticketRoutes);
app.use("/reports", reportRoutes);
app.use("/trips", tripRoutes);

const PORT = process.env.TICKET_SERVICE_PORT || 3004;

app.listen(PORT, () =>
  console.log(`Ticket Service running on port ${PORT}`)
);
