import express from "express";
import cors from "cors";
import { routeRouter } from "./routes/route.routes";

const app = express();

app.use(cors({
  origin: "http://localhost:5173",
  methods: ["GET", "POST", "DELETE", "PUT", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

app.use(express.json());

app.get("/health", (_req, res) => res.json({ ok: true }));
app.use("/routes", routeRouter);

export default app;
