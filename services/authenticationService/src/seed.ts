import "dotenv/config";
import { prisma } from "./db/prisma";
import { hashPassword } from "./utils/hashing";
import { UserType } from "@prisma/client";

// run: pnpm exec ts-node src/seed.ts
async function main() {
  const defaultPassword = "123456"; // change later
  const passwordHash = await hashPassword(defaultPassword);

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

  for (const a of seedAccounts) {
    const created = await prisma.account.upsert({
      where: { email: a.email },
      create: {
        email: a.email,
        username: a.username,
        passwordHash,
        isActive: true,
        userType: a.userType,
      },
      update: {
        // if you want seed to "refresh" accounts every time:
        username: a.username,
        isActive: true,
        userType: a.userType,
        // uncomment if you want to reset password on every seed:
        passwordHash,
      },
      select: { id: true, email: true, username: true, userType: true, isActive: true },
    });

    console.log("Seeded:", created);
  }

  console.log("\n✅ Seed done.");
  console.log(`Password for all seeded accounts: ${defaultPassword}`);
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
