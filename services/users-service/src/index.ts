import "dotenv/config";
import express from "express";
import { usersRouter } from "./routes/routes";
import cors from "cors"

const app = express();
app.use(express.json());

app.use(cors({
  origin: ["http://localhost:5173"], // vite default
  credentials: true
}));


app.get("/health", (_req, res) => res.json({ ok: true }));

app.use("/api/users", usersRouter);

const port = Number(process.env.USERS_SERVICE_PORT || process.env.PORT || 3005);
app.listen(port, () => console.log(`users service listening on http://localhost:${port}`));
