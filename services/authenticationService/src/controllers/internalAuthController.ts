import type { Request, Response } from "express";
import { Prisma, UserType } from "@prisma/client";
import { createAccount,findAccountById, getAccountPublicById ,updateAccountFields, updateAccountPasswordHash,   listAdminAccounts, setAccountActive, isAdminUserType, } from "../services/authService";
import { verifyPassword, hashPassword } from "../utils/hashing";

function isNonEmpty(s: unknown): s is string {
  return typeof s === "string" && s.trim().length > 0;
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

const allowedUserTypes = ["RouteManager", "Customer", "FinanceManager", "Cashier", "Driver"] as const;
const allowedAdminUserTypes = ["RouteManager", "FinanceManager", "Cashier"] as const;

type AllowedUserType = (typeof allowedUserTypes)[number];
type AllowedAdminUserType = (typeof allowedAdminUserTypes)[number];


function isAllowedUserType(user: unknown): user is AllowedUserType {
  return typeof user === "string" && (allowedUserTypes as readonly string[]).includes(user);
}
function isAllowedAdminUserType(v: unknown): v is AllowedAdminUserType {
  return typeof v === "string" && (allowedAdminUserTypes as readonly string[]).includes(v);
}

export async function getAccount(req: Request, res: Response) {
  const { id } = req.params;

  const account = await getAccountPublicById(id);
  if (!account) return res.status(404).json({ message: "account not found" });

  return res.status(200).json({ account });
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
  const {newEmail, newUsername, newPassword, userType } = req.body as {
    newEmail:string;
    newUsername:string;
    newPassword:string;
    userType?:string;
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

  // Validate userType if provided
  let prismaUserType: UserType = UserType.Customer;
  if (userType !== undefined) {
    if (!isAllowedUserType(userType)) {
      return res.status(400).json({ message: "invalid userType" });
    }
    prismaUserType = userType as UserType;
  }

  const newHashedPasword = await hashPassword(newPassword)
  
  try{
    const account = await createAccount(newEmail, newUsername, newHashedPasword, prismaUserType)
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
    updates.userType = userType as UserType;
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


// POST /api/internal/admin/accounts
export async function createAdminAccount(req: Request, res: Response) {
  const { newEmail, newUsername, newPassword, userType } = req.body as {
    newEmail?: string;
    newUsername?: string;
    newPassword?: string;
    userType?: unknown;
  };

  if (!newEmail || !isNonEmpty(newEmail) || !isValidEmail(newEmail))
    return res.status(400).json({ message: "invalid email" });

  if (!newUsername || !isNonEmpty(newUsername) || newUsername.trim().length < 3)
    return res.status(400).json({ message: "invalid username (min 3)" });

  if (!newPassword || !isNonEmpty(newPassword) || newPassword.length < 6)
    return res.status(400).json({ message: "invalid password (min 6)" });

  if (!isAllowedAdminUserType(userType))
    return res.status(400).json({ message: "invalid admin userType" });

  const prismaUserType = userType as UserType;
  if (!isAdminUserType(prismaUserType))
    return res.status(400).json({ message: "userType must be admin type" });

  const passwordHash = await hashPassword(newPassword);

  const created = await createAccount(newEmail, newUsername, passwordHash, prismaUserType);
  if ("error" in created) return res.status(409).json({ message: "email or username already in use" });

  return res.status(201).json({ accountId: created.id });
}

// GET /api/internal/admin/accounts
export async function getAdminAccounts(req: Request, res: Response) {
  const accounts = await listAdminAccounts();
  return res.status(200).json({ accounts });
}

// PATCH /api/internal/admin/accounts/:id/active
export async function patchAdminActive(req: Request, res: Response) {
  const { id } = req.params;
  const { isActive } = req.body as { isActive?: unknown };

  if (typeof isActive !== "boolean")
    return res.status(400).json({ message: "isActive must be boolean" });

  try {
    const updated = await setAccountActive(id, isActive);
    return res.status(200).json({ account: updated });
  } catch (e: any) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2025") {
      return res.status(404).json({ message: "account not found" });
    }
    return res.status(500).json({ message: "internal error" });
  }
}