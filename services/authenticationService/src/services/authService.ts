import { prisma } from "../db/prisma";
import { verifyPassword } from "../utils/hashing";
import { generateToken } from "@sidaroco/auth";

export async function loginWithEmail(email: string, password: string) {
  const account = await prisma.account.findUnique({
    where: { email },
    include: { user: true },
  });

  if (!account) return null;
  if (!account.isActive) return { error: "ACCOUNT_INACTIVE" as const };

  const ok = await verifyPassword(password, account.passwordHash);
  if (!ok) return null;

  const token = generateToken({
  id: account.id,
  email: account.email,
  username: account.username,
  role: account.userType, 
  });

  return {
    token,
    account: {
      id: account.id,
      email: account.email,
      username: account.username,
      userType: account.userType,
      isActive: account.isActive,
    },
    user: account.user
      ? {
          id: account.user.id,
          fullName: account.user.fullName,
          phoneNumber: account.user.phoneNumber,
        }
      : null,
  };
}
