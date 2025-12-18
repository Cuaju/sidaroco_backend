import type { Request, Response } from "express";
import { loginWithEmail } from "../services/authService";

export async function login(req: Request, res: Response) {
  const { email, password } = req.body as { email?: string; password?: string };

  if (!email || !password) {
    return res.status(400).json({ message: "email and password are required" });
  }

  const result = await loginWithEmail(email, password);

  if (!result) {
    return res.status(401).json({ message: "invalid credentials" });
  }

  if ("error" in result && result.error === "ACCOUNT_INACTIVE") {
    return res.status(403).json({ message: "account is inactive" });
  }

  return res.status(200).json(result);
}
