import "dotenv/config";
import express from "express";
import cors from "cors";
import { routeRouter } from "./routes/route.routes";

const app = express();

app.use(express.json());
app.use(cors({
  origin: ["http://localhost:5173"],
  credentials: true
}));

app.use("/routes", routeRouter);

const port = Number(process.env.PORT || 3003);
app.listen(port, () => {
  console.log(`route-service listening on http://localhost:${port}`);
});
