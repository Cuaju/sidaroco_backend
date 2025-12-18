import "dotenv/config";
import { prisma } from "./db/prisma";
import { hashPassword } from "./utils/hashing";

async function main() {
  const passwordHash = await hashPassword("123456");

  const account = await prisma.account.create({
    data: {
      email: "test@uv.mx",
      username: "test",
      passwordHash,
      userType: "Customer",
      isActive: true,
      user: {
        create: {
          fullName: "Test User",
          phoneNumber: "2280000000",
        },
      },
    },
  });

  console.log("seed ok:", account.id);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
