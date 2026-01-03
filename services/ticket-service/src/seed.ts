import "dotenv/config";
import prisma from "./db/prisma";

async function main() {
  const userId = "cmjn5uoqd0001zw9w6034yll9";
  const now = new Date();

  const pastTripDate = new Date(now);
  pastTripDate.setDate(now.getDate() - 5);

  const upcomingTripDate = new Date(now);
  upcomingTripDate.setDate(now.getDate() + 5);

  const trips = [
    {
      routeId: 61,
      departureTime: pastTripDate,
      status: "COMPLETED",
    },
    {
      routeId: 68,
      departureTime: upcomingTripDate,
      status: "SCHEDULED",
    },
  ];

  const createdTrips = [];

  for (const trip of trips) {
    const createdTrip = await prisma.trip.create({
      data: trip,
      select: {
        id: true,
        routeId: true,
        departureTime: true,
      },
    });
    createdTrips.push(createdTrip);
  }

  const tickets = [
    {
      tripId: createdTrips[0].id,
      userId,
      seatNumber: 6,
      price: 450.0,
      status: "ACTIVE",
      saleDate: createdTrips[0].departureTime,
    },
    {
      tripId: createdTrips[1].id,
      userId,
      seatNumber: 22,
      price: 620.0,
      status: "ACTIVE",
      saleDate: createdTrips[1].departureTime,
    },
  ];

  for (const ticket of tickets) {
    const createdTicket = await prisma.ticket.create({
      data: ticket,
      select: {
        id: true,
        tripId: true,
        userId: true,
        seatNumber: true,
        price: true,
        saleDate: true,
        status: true,
      },
    });
    console.log("Seeded ticket:", createdTicket);
  }

  console.log("Seed completed");
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
