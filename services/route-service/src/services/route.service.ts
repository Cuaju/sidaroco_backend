import prisma from "../db/prisma";

export type LocationInput = {
  name: string;
  lat: number;
  lng: number;
};

export type CreateRouteInput = {
  name: string;
  ticketPrice: number; 
  origin: LocationInput;
  destination: LocationInput;
};

export class RouteService {
  static async list(params?: { skip?: number; take?: number; q?: string }) {
    const { skip = 0, take = 50, q } = params ?? {};

    return prisma.route.findMany({
      skip,
      take,
      where: q
        ? { name: { contains: q, mode: "insensitive" } }
        : undefined,
      include: {
        origin: true,
        destination: true,
      },
      orderBy: { createdAt: "desc" },
    });
  }

  static async getById(id: number) {
    return prisma.route.findUnique({
      where: { id },
      include: {
        origin: true,
        destination: true,
      },
    });
  }

  static async create(input: CreateRouteInput) {
    return prisma.route.create({
      data: {
        name: input.name,
        ticketPrice: input.ticketPrice, 
        origin: {
          connectOrCreate: {
            where: {
              location_name_lat_lng_unique: {
                name: input.origin.name,
                lat: input.origin.lat,
                lng: input.origin.lng,
              },
            },
            create: {
              name: input.origin.name,
              lat: input.origin.lat,
              lng: input.origin.lng,
            },
          },
        },
        destination: {
          connectOrCreate: {
            where: {
              location_name_lat_lng_unique: {
                name: input.destination.name,
                lat: input.destination.lat,
                lng: input.destination.lng,
              },
            },
            create: {
              name: input.destination.name,
              lat: input.destination.lat,
              lng: input.destination.lng,
            },
          },
        },
      },
      include: {
        origin: true,
        destination: true,
      },
    });
  }

  static async update(id: number, input: CreateRouteInput) {
    return prisma.route.update({
      where: { id },
      data: {
        name: input.name,
        ticketPrice: input.ticketPrice, 
        origin: {
          connectOrCreate: {
            where: {
              location_name_lat_lng_unique: {
                name: input.origin.name,
                lat: input.origin.lat,
                lng: input.origin.lng,
              },
            },
            create: {
              name: input.origin.name,
              lat: input.origin.lat,
              lng: input.origin.lng,
            },
          },
        },
        destination: {
          connectOrCreate: {
            where: {
              location_name_lat_lng_unique: {
                name: input.destination.name,
                lat: input.destination.lat,
                lng: input.destination.lng,
              },
            },
            create: {
              name: input.destination.name,
              lat: input.destination.lat,
              lng: input.destination.lng,
            },
          },
        },
      },
      include: {
        origin: true,
        destination: true,
      },
    });
  }

  static async remove(id: number) {
    return prisma.route.delete({
      where: { id },
    });
  }
}
