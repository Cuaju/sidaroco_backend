import "dotenv/config";
import express from "express";
import { usersRouter } from "./routes/routes";

const app = express();
app.use(express.json());


app.get("/health", (_req, res) => res.json({ ok: true }));

app.use("/api/users", usersRouter);

const port = Number(process.env.USERS_SERVICE_PORT || process.env.PORT || 3005);
app.listen(port, () => console.log(`users service listening on http://localhost:${port}`));
