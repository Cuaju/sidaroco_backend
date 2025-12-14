import express from "express";
import dotenv from "dotenv";
import driverRoutes from "./routes/driver.routes";
import busRoutes from "./routes/bus.routes";
dotenv.config();

const app = express();
app.use(express.json());

app.use("/drivers", driverRoutes);
app.use("/buses", busRoutes);


const PORT = process.env.FLEET_SERVICE_PORT || 3000;

app.listen(PORT, () => console.log(`Fleet Service running on port ${PORT}`));

