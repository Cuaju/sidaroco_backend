import type { Request, Response } from "express";
import { Prisma } from "../generated/prisma/client";
import { authCreateAccount, authGetAccount,authPatchAccount, authPatchPassword , authGetAdminAccounts, authSetAdminActive, authCreateAdminAccount} from "../utils/authClient";
import { createProfile, getProfileByAccountId, updateProfileByAccountId, getProfilesByAccountIds } from "../services/usersService";
import { requestCode, verifyCodeAndCreateAccount } from "../services/emailTokenService";


function isNonEmpty(s: unknown): s is string {
  return typeof s === "string" && s.trim().length > 0;
}
function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}


function requireFinanceManager(req: Request, res: Response): boolean {
  const role = (req.user as any)?.role ?? (req.user as any)?.userType;
  if (role !== "FinanceManager") {
    res.status(403).json({ message: "forbidden" });
    return false;
  }
  return true;
}

// GET /api/users/admin/accounts
export async function getAdminAccounts(req: Request, res: Response) {
  if (!requireFinanceManager(req, res)) return;

  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: "unauthorized" });

  const { accounts } = await authGetAdminAccounts(authHeader);

  const ids = accounts.map((a) => a.id);
  const profiles = await getProfilesByAccountIds(ids);
  const map = new Map(profiles.map((p) => [p.accountId, p]));

  const out = accounts.map((a) => ({
    ...a,
    profile: map.get(a.id) ?? null,
  }));

  return res.status(200).json({ accounts: out });
}

// POST /api/users/admin/accounts
export async function createAdminAccountWithProfile(req: Request, res: Response) {
  if (!requireFinanceManager(req, res)) return;

  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: "unauthorized" });

  const { email, username, password, userType, fullName, phoneNumber } = req.body as any;

  if (!email || !isNonEmpty(email) || !isValidEmail(email)) return res.status(400).json({ message: "invalid email" });
  if (!username || !isNonEmpty(username) || username.trim().length < 3) return res.status(400).json({ message: "invalid username" });
  if (!password || !isNonEmpty(password) || password.length < 6) return res.status(400).json({ message: "invalid password (min 6)" });

  const allowed = ["RouteManager", "FinanceManager", "Cashier"];
  if (!allowed.includes(userType)) return res.status(400).json({ message: "invalid admin userType" });

  if (!fullName || !isNonEmpty(fullName)) return res.status(400).json({ message: "fullName is required" });
  if (phoneNumber !== undefined && phoneNumber !== null && typeof phoneNumber !== "string")
    return res.status(400).json({ message: "invalid phoneNumber" });

  // 1) create account in auth
  const created = await authCreateAdminAccount(authHeader, {
    email: email,
    username: username.trim(),
    password,
    userType,
  });

  const accountId = created.accountId;

  // 2) create profile in users db
  try {
    const profile = await createProfile(accountId, fullName.trim(), phoneNumber?.trim());
    return res.status(201).json({ accountId, profile });
  } catch (e: any) {
    // compensation: deactivate account if profile failed
    try {
      await authSetAdminActive(authHeader, accountId, false);
    } catch {}
    return res.status(500).json({ message: "profile create failed (account created but deactivated)" });
  }
}

// PATCH /api/users/admin/accounts/:accountId/active
export async function setAdminActive(req: Request, res: Response) {
  if (!requireFinanceManager(req, res)) return;

  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: "unauthorized" });

  const { accountId } = req.params;
  const { isActive } = req.body as { isActive?: unknown };

  if (typeof isActive !== "boolean") return res.status(400).json({ message: "isActive must be boolean" });

  const out = await authSetAdminActive(authHeader, accountId, isActive);
  return res.status(200).json(out);
}

// POST /api/users/register
export async function register(req: Request, res: Response) {
    const { email, username, password, fullName, phoneNumber } = req.body as {
        email?: string;
        username?: string;
        password?: string;
        fullName?: string;
        phoneNumber?: string;
    };

    if (!email || !isNonEmpty(email) || !isValidEmail(email)){
        return res.status(400).json({ message: "invalid email" });
    }

    if (!username || !isNonEmpty(username) || username.trim().length < 3) {
        return res.status(400).json({ message: "invalid username" });
    }

    if (!password || !isNonEmpty(password) || password.length < 6){
        return res.status(400).json({ message: "invalid password " });
    }
  
    if (!fullName || !isNonEmpty(fullName)){
        return res.status(400).json({ message: "fullName is required" });
    }
    let accountId: string;
    try {
        const created = await authCreateAccount({
        email: email.trim().toLowerCase(),
        username: username.trim(),
        password,
        });
        accountId = created.accountId;
    } catch (e: any) {
        return res.status(400).json({ message: String(e.message ?? e) });
    }

    try {
        const profile = await createProfile(accountId, fullName.trim(), phoneNumber?.trim());
        return res.status(201).json({ accountId, profile });
    } catch (e: any) {
        if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
            return res.status(409).json({ message: "profile already exists for this accountId" });
        }
        return res.status(500).json({ message: "internal error creating profile" });
    }
}


// POST /api/users/profile
export async function createProfileForExistingAccount(req: Request, res: Response) {
    const { accountId, fullName, phoneNumber } = req.body as {
        accountId?: string;
        fullName?: string;
        phoneNumber?: string;
    };

    if (!accountId || !isNonEmpty(accountId)) {
        return res.status(400).json({ message: "accountId is required" });
    }
    
    if (!fullName || !isNonEmpty(fullName)) {
        return res.status(400).json({ message: "fullName is required" });
    }

    try {

        const profile = await createProfile(accountId.trim(), fullName.trim(), phoneNumber?.trim());
        return res.status(201).json({ profile });

    } 
    catch (e: any) {
        if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
            return res.status(409).json({ message: "profile already exists for this accountId" });
        }

        return res.status(500).json({ message: "internal error creating profile" });
    }
}


// GET /api/users/me
export async function getMe(req: Request, res: Response) {
  const accountId = req.user?.id;
  const authHeader = req.headers.authorization;

  if (!accountId || !authHeader) {
    return res.status(401).json({ message: "unauthorized" });
  }

  const [{ account }, profile] = await Promise.all([
    authGetAccount(accountId, authHeader),
    getProfileByAccountId(accountId),
  ]);

  return res.status(200).json({ account, profile });
}

// PATCH /api/users/me  (profile + optional account patch)
export async function patchMe(req: Request, res: Response) {
  const accountId = req.user?.id;
  const authHeader = req.headers.authorization;

  if (!accountId || !authHeader) return res.status(401).json({ message: "unauthorized" });

  const { fullName, phoneNumber, email, username } = req.body as {
    fullName?: string;
    phoneNumber?: string | null;
    email?: string;
    username?: string;
  };

  const profilePatch: any = {};
  if (fullName !== undefined) {
    if (!isNonEmpty(fullName)){ 
        return res.status(400).json({ message: "invalid fullName" });
    }
    profilePatch.fullName = fullName.trim();

  }
  if (phoneNumber !== undefined) {
    if (phoneNumber !== null && typeof phoneNumber !== "string"){
        return res.status(400).json({ message: "invalid phoneNumber" });
    }
    profilePatch.phoneNumber = phoneNumber === null ? null : phoneNumber.trim();
  }

  // account patch (orchestrated)
  const accountPatch: any = {};
  if (email !== undefined) {
    if (!isNonEmpty(email) || !isValidEmail(email)){ 
        return res.status(400).json({ message: "invalid email" });
    }
    accountPatch.email = email.trim().toLowerCase();
  }
  if (username !== undefined) {
    if (!isNonEmpty(username) || username.trim().length < 3){
        return res.status(400).json({ message: "invalid username" });
    }
    accountPatch.username = username.trim();
  }

  try {
    const out: any = {};

    if (Object.keys(accountPatch).length > 0) {
        out.account = await authPatchAccount(accountId, authHeader, accountPatch);
    }

    if (Object.keys(profilePatch).length > 0) {
        out.profile = await updateProfileByAccountId(accountId, profilePatch);
    }
        return res.status(200).json(out);
    
    } catch (e: any) {
        return res.status(400).json({ message: String(e.message ?? e) });
    }
}

// PATCH /api/users/me/password
export async function changeMyPassword(req: Request, res: Response) {

    const accountId = req.user?.id;
    const authHeader = req.headers.authorization;

    if (!accountId || !authHeader){
        return res.status(401).json({ message: "unauthorized" });
    }

    const { currentPassword, newPassword } = req.body as { 
        currentPassword?: string;
        newPassword?: string 
    };
    
    if (!currentPassword || !isNonEmpty(currentPassword)){
        return res.status(400).json({ message: "currentPassword required" });
    }

    if (!newPassword || !isNonEmpty(newPassword) || newPassword.length < 6){ 
        return res.status(400).json({ message: "invalid newPassword (min 6)" });
    }

    try {
        const result = await authPatchPassword(accountId, authHeader, { currentPassword, newPassword });
        return res.status(200).json(result);
    } 
    catch (e: any) {
        return res.status(400).json({ message: String(e.message ?? e) });
    }
}

export async function requestRegisterCode(req: Request, res: Response) {
    const { email, username, password, verifyPassword } = req.body as {
        email?: string;
        username?: string;
        password?: string;
        verifyPassword?: string;
    };

    if (!email || !isNonEmpty(email) || !isValidEmail(email)){
        return res.status(400).json({ message: "invalid email" });
    }

    if (!username || !isNonEmpty(username) || username.trim().length < 3){
        return res.status(400).json({ message: "invalid username" });   
    }
    
    if (!password || !isNonEmpty(password) || password.length < 6){
        return res.status(400).json({ message: "invalid password (min 6)" });
    }

    if (verifyPassword !== password){
        return res.status(400).json({ message: "passwords do not match" });
    }
    try {

    await requestCode(email.trim().toLowerCase(), username.trim(), password);
    
    return res.status(200).json({ ok: true });
  
    } 
    catch (e: any) {
    return res.status(400).json({ message: e.message || "could not send code" });
  }
}


export async function verifyRegisterCode(req: Request, res: Response) {
console.log("verify body:", req.body);

    const { email, code } = req.body as {
        email?: string; 
        code?: string 
    };

    if (!email || !isNonEmpty(email) || !isValidEmail(email)){
        return res.status(400).json({ message: "invalid email" });
    }
  
    if (!code || !isNonEmpty(code) || code.trim().length !== 6){
        return res.status(400).json({ message: "invalid code" });
    }
    try {
        const out = await verifyCodeAndCreateAccount(email.trim().toLowerCase(), code.trim());
        return res.status(200).json(out); // { accountId }
    } 
    catch (e: any) {
        return res.status(400).json({ message: e.message || "verify failed" });
  }
}
