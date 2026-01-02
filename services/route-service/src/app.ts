import express from "express";
import { routeRouter } from "./routes/route.routes";

const app = express();

app.use(express.json());

app.get("/health", (_req, res) => res.json({ ok: true }));
app.use("/routes", routeRouter);

export default app;
