import prisma from "../db/prisma";

export type LocationInput = {
  name: string;
  lat: number;
  lng: number;
};

export type CreateRouteInput = {
  name: string;
  ticketPrice?: number;
  featured?: boolean;
  photoKey?: string | null;
  origin: LocationInput;
  destination: LocationInput;
};

export type UpdateRouteInput = Partial<CreateRouteInput>;

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
        ticketPrice: input.ticketPrice ?? null,
        featured: input.featured ?? false,
        photoKey: input.photoKey ?? null,
  
        origin: {
          connectOrCreate: {
            where: {
              location_name_lat_lng_unique: {
                name: input.origin.name,
                lat: input.origin.lat,
                lng: input.origin.lng,
              },
            },
            create: input.origin,
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
            create: input.destination,
          },
        },
      },
      include: {
        origin: true,
        destination: true,
      },
    });
  }
  
  static async getFeatured() {
    return prisma.route.findMany({
      where: { featured: true },
      include: {
        origin: true,
        destination: true,
      },
      orderBy: { createdAt: "desc" },
    });
  }
  static async update(id: number, input: UpdateRouteInput) {
    const cleanOrigin = input.origin
      ? {
          name: input.origin.name,
          lat: input.origin.lat,
          lng: input.origin.lng,
        }
      : undefined;
  
    const cleanDestination = input.destination
      ? {
          name: input.destination.name,
          lat: input.destination.lat,
          lng: input.destination.lng,
        }
      : undefined;
  
    return prisma.route.update({
      where: { id },
      data: {
        name: input.name,
        ticketPrice: input.ticketPrice,
        featured: input.featured,
        photoKey: input.photoKey,
  
        ...(cleanOrigin && {
          origin: {
            connectOrCreate: {
              where: {
                location_name_lat_lng_unique: cleanOrigin,
              },
              create: cleanOrigin,
            },
          },
        }),
  
        ...(cleanDestination && {
          destination: {
            connectOrCreate: {
              where: {
                location_name_lat_lng_unique: cleanDestination,
              },
              create: cleanDestination,
            },
          },
        }),
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
