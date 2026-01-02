import "dotenv/config";
import express from "express";
import scheduleRoutes from "./routes/schedule.routes";

const app = express();
app.use(express.json());

app.use("/schedule", scheduleRoutes);
export default app;
