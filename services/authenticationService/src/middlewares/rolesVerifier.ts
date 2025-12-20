import type { Request, Response, NextFunction } from "express";

export function allowSelfOrRoles(roles: string[] = []) {
  return (req: Request, res: Response, next: NextFunction) => {
    const callerId = req.user?.id;
    const callerRole = req.user?.role;
    const targetId = req.params.id;

    const isSelf = callerId && targetId && callerId === targetId;
    const isPrivileged = roles.length > 0 && callerRole && roles.includes(callerRole);

    if (!isSelf && !isPrivileged) {
      return res.status(403).json({ msg: "Access Denied" });
    }

    next();
  };
}
