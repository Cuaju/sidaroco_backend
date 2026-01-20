import "dotenv/config";
import express from "express";
import scheduleRoutes from "./routes/schedule.routes";
import driverRoutes from "./routes/driver.routes";

const app = express();
app.use(express.json());

app.use("/schedule", scheduleRoutes);
app.use("/schedule/driver", driverRoutes);
export default app;
