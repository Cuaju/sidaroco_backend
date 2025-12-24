import "dotenv/config";
import prisma from "./db/prisma";

async function main() {
  const userId = 1;

  const now = new Date();

  const pastTripDate = new Date(now);
  pastTripDate.setDate(now.getDate() - 5); // 3 días atrás

  const upcomingTripDate = new Date(now);
  upcomingTripDate.setDate(now.getDate() + 5); // 5 días adelante

  const tickets = [
    {
      routeId: 101,
      userId,
      price: 450.0,
      status: "ACTIVE",
      saleDate: pastTripDate,
    },
    {
      routeId: 202,
      userId,
      price: 620.0,
      status: "ACTIVE",
      saleDate: upcomingTripDate,
    },
  ];

  for (const t of tickets) {
    const created = await prisma.ticket.create({
      data: t,
      select: {
        id: true,
        routeId: true,
        userId: true,
        price: true,
        saleDate: true,
        status: true,
      },
    });

    console.log("Seeded ticket:", created);
  }

  console.log("\n✅ Ticket seed done for userId = 1");
}

main()
  .catch((e) => {
    console.error("❌ Ticket seed failed:", e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
