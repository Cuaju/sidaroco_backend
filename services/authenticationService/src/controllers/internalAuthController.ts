import type { Request, Response } from "express";
import { Prisma } from "@prisma/client";
import { createAccount,findAccountById, updateAccountFields, updateAccountPasswordHash } from "../services/authService";
import { verifyPassword, hashPassword } from "../utils/hashing";

function isNonEmpty(s: unknown): s is string {
  return typeof s === "string" && s.trim().length > 0;
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

const allowedUserTypes = ["RouteManager", "Customer", "FinanceManager", "Cashier"] as const;
type AllowedUserType = (typeof allowedUserTypes)[number];

function isAllowedUserType(user: unknown): user is AllowedUserType {
  return typeof user === "string" && (allowedUserTypes as readonly string[]).includes(user);
}

export async function createNewAccountHashed(req: Request, res: Response) {
  const { newEmail, newUsername, passwordHash } = req.body as {
    newEmail?: string;
    newUsername?: string;
    passwordHash?: string;
  };

  if (!newEmail || !isNonEmpty(newEmail) || !isValidEmail(newEmail)){
    return res.status(400).json({ message: "invalid email" });
  }
  
  if (!newUsername || !isNonEmpty(newUsername)){
    return res.status(400).json({ message: "invalid username" });
  }

  if (!passwordHash || !isNonEmpty(passwordHash)){
    return res.status(400).json({ message: "passwordHash required" });
  }

  try {
    
    const account = await createAccount(newEmail, newUsername, passwordHash);

    return res.status(201).json({ accountId: account.id });
  } 
  catch (e: any) {
    
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return res.status(409).json({ message: "email or username already in use" });
    }

    return res.status(500).json({ message: "internal error" });
  }
}


//POST /internal/newAccount
export async function createNewAccount(req: Request, res:Response) {
  const {newEmail, newUsername, newPassword } = req.body as {
    newEmail:string;
    newUsername:string;
    newPassword:string;
  }
  
  if ( newEmail !== undefined){
    if(!isNonEmpty(newEmail) || !isValidEmail(newEmail)){
      return res.status(400).json({message: "Invalid email dude try a good one"})   
    }
  }

  if (newUsername!==undefined){
    if(!isNonEmpty(newUsername)){
      return res.status(400).json({message: "Hell nah bro bad username try again"})
    }
  }

  if (newPassword!==undefined){
    if(!isNonEmpty(newPassword)){
      return res.status(400).json({message: "No empty Password"})
    }
  }

  const newHashedPasword = await hashPassword(newPassword)
  
  try{
    const account = await createAccount(newEmail, newUsername, newHashedPasword)
    return res.status(201).json({accountId: account.id})
  }
  catch (e: any) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return res.status(409).json({ message: "email or username already in use" });
    }
    return res.status(500).json({ message: "internal error" });
  }
}

// PATCH /internal/accounts/:id
export async function updateAccount(req: Request, res: Response) {
  const { id } = req.params;

  const { email, username, isActive, userType } = req.body as {
    email?: unknown;
    username?: unknown;
    isActive?: unknown;
    userType?: unknown;
  };

  const updates: any = {};

  if (email !== undefined) {
    if (!isNonEmpty(email) || !isValidEmail(email)) {
      return res.status(400).json({ message: "invalid email" });
    }
    updates.email = email.trim().toLowerCase();
  }

  if (username !== undefined) {
    if (!isNonEmpty(username) || username.trim().length < 3) {
      return res.status(400).json({ message: "invalid username (min 3)" });
    }
    updates.username = username.trim();
  }

  if (isActive !== undefined) {
    if (typeof isActive !== "boolean") {
      return res.status(400).json({ message: "invalid isActive (boolean)" });
    }
    updates.isActive = isActive;
  }

  if (userType !== undefined) {
    if (!isAllowedUserType(userType)) {
      return res.status(400).json({ message: "invalid userType" });
    }
    updates.userType = userType;
  }

  if (Object.keys(updates).length === 0) {
    return res.status(400).json({ message: "no fields to update" });
  }

  try {
    const updated = await updateAccountFields(id, updates);

    return res.status(200).json({
      account: {
        id: updated.id,
        email: updated.email,
        username: updated.username,
        userType: updated.userType,
        isActive: updated.isActive,
      },
    });
  } catch (e: any) {
    // unique duplicated
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return res.status(409).json({ message: "email or username already in use" });
    }
    //not found
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2025") {
      return res.status(404).json({ message: "account not found" });
    }
    return res.status(500).json({ message: "internal error" });
  }
}

// PATCH /internal/accounts/:id/password
export async function updatePassword(req: Request, res: Response) {
  const { id } = req.params;

  const { currentPassword, newPassword, adminReset } = req.body as {
    currentPassword?: unknown;
    newPassword?: unknown;
    adminReset?: unknown;
  };

  if (!isNonEmpty(newPassword) || newPassword.length < 6) {
    return res.status(400).json({ message: "invalid newPassword (min 6)" });
  }

  const account = await findAccountById(id);
  if (!account) return res.status(404).json({ message: "account not found" });

  const isAdminReset = adminReset === true;

  if (!isAdminReset) {
    if (!isNonEmpty(currentPassword)) {
      return res.status(400).json({ message: "currentPassword is required" });
    }

    const ok = await verifyPassword(currentPassword, account.passwordHash);
    if (!ok) return res.status(401).json({ message: "invalid currentPassword" });
  }

  const newHash = await hashPassword(newPassword);
  await updateAccountPasswordHash(id, newHash);

  return res.status(200).json({ message: "password updated" });
}
