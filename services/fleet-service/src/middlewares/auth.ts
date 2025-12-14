import { Request, Response, NextFunction } from "express";

export function requireAuth(req: Request, res: Response, next: NextFunction) {
 
    const userId = req.headers["x-user-id"];
    const userRole = req.headers["x-user-role"];

    if (!userId || !userRole) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    req.user = {
        id: Number(userId),
        role: userRole as string,
    };
    next();
}