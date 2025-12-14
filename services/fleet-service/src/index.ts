import "dotenv/config";
import dotenv from "dotenv";
import express from "express";
import driverRoutes from "./routes/driver.routes";
import busRoutes from "./routes/bus.routes";

const app = express();
app.use(express.json());

app.use("/drivers", driverRoutes);
app.use("/buses", busRoutes);


const PORT = process.env.FLEET_SERVICE_PORT || 3000;

app.listen(PORT, () => console.log(`Fleet Service running on port ${PORT}`));

