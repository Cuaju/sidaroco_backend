import "dotenv/config";
import express from "express";
import ticketRoutes from "./routes/ticketRoutes";
import reportRoutes from "./routes/reportRoutes";
import tripRoutes from "./routes/tripRoutes";
import cors from "cors";

const app = express();

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());

app.use("/tickets", ticketRoutes);
app.use("/reports", reportRoutes);
app.use("/trips", tripRoutes);

const PORT = process.env.TICKET_SERVICE_PORT || 3004;

app.listen(PORT, () =>
  console.log(`Ticket Service running on port ${PORT}`)
);
