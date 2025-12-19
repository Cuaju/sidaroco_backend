import "dotenv/config";
import express from "express";
import { authRouter } from "./routes/authRoutes";

const app = express();


app.use(express.json());

app.get("/health", (_req, res) => res.json({ ok: true }));

app.use("/api/auth", authRouter);


const port = Number(process.env.PORT || 4000);
app.listen(port, () => {
  console.log(`auth service listening on http://localhost:${port}`);
});
