import { prisma } from "../db/prisma";

export async function createProfile(accountId: string, fullName: string, phoneNumber?: string) {
  return prisma.userProfile.create({
    data: { accountId, fullName, phoneNumber },
    select: { id: true, accountId: true, fullName: true, phoneNumber: true },
  });
}

export async function getProfileByAccountId(accountId: string) {
  return prisma.userProfile.findUnique({
    where: { accountId },
    select: { id: true, accountId: true, fullName: true, phoneNumber: true },
  });
}

export async function updateProfileByAccountId(
  accountId: string,
  patch: Partial<{ fullName: string; phoneNumber: string | null }>
) 
{
  return prisma.userProfile.update({
    where: { accountId },
    data: patch,
    select: { id: true, accountId: true, fullName: true, phoneNumber: true },
  });
}
