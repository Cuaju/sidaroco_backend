import { prisma } from "../db/prisma";
import { verifyPassword } from "../utils/hashing";
const { generateToken } = require("@sidaroco/auth") as {
  generateToken: (args: { id: string; email: string; username: string; role: string }) => string;
};
import { Prisma, UserType } from "@prisma/client";

export async function loginWithEmail(email: string, password: string) {
  const account = await prisma.account.findUnique({
    where: { email },
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
  };
}

export async function createAccount(_email:string, _username:string, _passwordHash:string) {
  try{
    const account = prisma.account.create({
      data:{
        email:_email,
        username: _username,
        passwordHash: _passwordHash,
        isActive: true,
        userType: UserType.Customer
      }
    })

    return {id: (await account).id};
  }
  catch (e: any) {
  if (e?.code === "P2002") {
    return { error: "DUPLICATE EMAIL OR USERNAME" as const };
  }
    throw e;
  }
}

export async function findAccountById(id: string) {
  return prisma.account.findUnique({ where: { id } });
}

export async function updateAccountFields(
  id: string,
  data: Partial<{
    email: string;
    username: string;
    isActive: boolean;
    userType: UserType;
  }>
) {
  return prisma.account.update({
    where: { id },
    data,
  });
}

export async function updateAccountPasswordHash(id: string, passwordHash: string) {
  return prisma.account.update({
    where: { id },
    data: { passwordHash },
  });
}