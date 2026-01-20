import "dotenv/config";
import express from "express";
import cors from "cors";
import { authRouter } from "./routes/authRoutes";
import { internalRouter } from "./routes/internalAuthRoutes";
const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => res.json({ ok: true }));

app.use("/api/auth", authRouter);
app.use("/api", internalRouter);

const port = Number(process.env.PORT || 3000);
app.listen(port, () => {
  console.log(`auth service listening on http://localhost:${port}`);
});
