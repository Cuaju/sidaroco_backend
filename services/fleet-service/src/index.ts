import "dotenv/config";
import app from "./app";
import cors from "cors"

const corsURL =  String(process.env.CORS_DOMAIN || "http://localhost:5173");

app.use(cors({
  origin: [corsURL], 
  credentials: true
}));

const PORT = process.env.FLEET_SERVICE_PORT || 3000;

app.listen(PORT, () => console.log(`Fleet Service running on port ${PORT}`));

