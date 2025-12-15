import "dotenv/config";
import express from "express";
import driverRoutes from "./routes/driver.routes";
import busRoutes from "./routes/bus.routes";

const app = express();
app.use(express.json());

app.use("/drivers", driverRoutes);
app.use("/buses", busRoutes);

export default app;
