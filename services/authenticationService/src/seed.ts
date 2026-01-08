import "dotenv/config";
import { prisma } from "./db/prisma";
import { hashPassword } from "./utils/hashing";
import { UserType } from "@prisma/client";

// run: pnpm exec ts-node src/seed.ts
async function main() {
  const passwords = [
    "RouteManager7#",
    "Customer2026!",
    "FinanceManager3$",
    "Cashier9*Pass",
  ];

  const seedAccounts = [
    {
      email: "routeManager@sidaroco.com",
      username: "route_manager",
      userType: UserType.RouteManager,
    },
    {
      email: "customer@sidaroco.com",
      username: "customer",
      userType: UserType.Customer,
    },
    {
      email: "financeManager@sidaroco.com",
      username: "finance_manager",
      userType: UserType.FinanceManager,
    },
    {
      email: "cashier@sidaroco.com",
      username: "cashier",
      userType: UserType.Cashier,
    },
  ];
for (let i = 0; i < seedAccounts.length; i++) {
    const account = seedAccounts[i];
    const passwordHash = await hashPassword(passwords[i]);

    const existing = await prisma.account.findFirst({
      where: { OR: [{ email: account.email }, { username: account.username }] },
      select: { id: true },
    });

    const created = existing
      ? await prisma.account.update({
          where: { id: existing.id },
          data: {
            email: account.email,
            username: account.username,
            isActive: true,
            userType: account.userType,
            passwordHash,
          },
          select: { id: true, email: true, username: true, userType: true, isActive: true },
        })
      : await prisma.account.create({
          data: {
            email: account.email,
            username: account.username,
            isActive: true,
            userType: account.userType,
            passwordHash,
          },
          select: { id: true, email: true, username: true, userType: true, isActive: true },
        });

    console.log("Seeded:", created.email);
    console.log("Password:", passwords[i]);
  }

  console.log("\nSeed done.");
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });