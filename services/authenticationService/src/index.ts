import "dotenv/config";
import express from "express";
import { authRouter } from "./routes/authRoutes";
import { internalRouter } from "./routes/internalAuthRoutes";
import cors from "cors";
const app = express();


app.use(express.json());

const corsURL =  String(process.env.CORS_DOMAIN || "http://localhost:5173");

app.use(cors({
  origin: [corsURL], 
  credentials: true
}));

app.get("/health", (_req, res) => res.json({ ok: true }));

app.use("/api/auth", authRouter);
app.use("/api", internalRouter);

const port = Number(process.env.PORT || 3000);
app.listen(port, () => {
  console.log(`auth service listening on http://localhost:${port}`);
});
