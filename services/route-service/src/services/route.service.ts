import prisma from "../db/prisma";
export type LocationInput = {
  mapboxId: string;
  name: string;
  fullName: string;
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
  static async list(params?: {
    skip?: number;
    take?: number;
    q?: string;
    origin?: string;
    destination?: string;
    featured?: boolean;
    minPrice?: number;
    maxPrice?: number;
  }) {
    const {
      skip,
      take,
      q,
      origin,
      destination,
      featured,
      minPrice,
      maxPrice,
    } = params ?? {};
  
    return prisma.route.findMany({
      ...(typeof skip === "number" && { skip }),
      ...(typeof take === "number" && { take }),
  
      where: {
        AND: [
          q
            ? { name: { contains: q, mode: "insensitive" } }
            : {},
  
          origin
            ? {
                origin: {
                  name: { contains: origin, mode: "insensitive" },
                },
              }
            : {},
  
          destination
            ? {
                destination: {
                  name: { contains: destination, mode: "insensitive" },
                },
              }
            : {},
  
          typeof featured === "boolean"
            ? { featured }
            : {},
  
          minPrice !== undefined
            ? { ticketPrice: { gte: minPrice } }
            : {},
  
          maxPrice !== undefined
            ? { ticketPrice: { lte: maxPrice } }
            : {},
        ],
      },
  
      include: {
        origin: true,
        destination: true,
      },
  
      orderBy: {
        createdAt: "desc",
      },
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

    const nameExists = await prisma.route.findFirst({
      where: {
        name: { equals: input.name, mode: "insensitive" },
      },
    });
  
    if (nameExists) {
      const error: any = new Error("ROUTE_NAME_EXISTS");
      error.code = "ROUTE_NAME_EXISTS";
      throw error;
    }
    const origin = await prisma.location.findUnique({
      where: { mapboxId: input.origin.mapboxId },
    });
  
    const destination = await prisma.location.findUnique({
      where: { mapboxId: input.destination.mapboxId },
    });
  
    if (origin && destination) {
      const routeExists = await prisma.route.findFirst({
        where: {
          originId: origin.id,
          destinationId: destination.id,
        },
      });
  
      if (routeExists) {
        const error: any = new Error("ROUTE_ORIGIN_DESTINATION_EXISTS");
        error.code = "ROUTE_ORIGIN_DESTINATION_EXISTS";
        throw error;
      }
    }
  
    return prisma.route.create({
      data: {
        name: input.name,
        ticketPrice: input.ticketPrice ?? null,
        featured: input.featured ?? false,
        photoKey: input.photoKey ?? null,
  
        origin: {
          connectOrCreate: {
            where: { mapboxId: input.origin.mapboxId },
            create: {
              mapboxId: input.origin.mapboxId,
              name: input.origin.name,
              fullName: input.origin.fullName,
              lat: input.origin.lat,
              lng: input.origin.lng,
            },
          },
        },
  
        destination: {
          connectOrCreate: {
            where: { mapboxId: input.destination.mapboxId },
            create: {
              mapboxId: input.destination.mapboxId,
              name: input.destination.name,
              fullName: input.destination.fullName,
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
          mapboxId: input.origin.mapboxId,
          name: input.origin.name,
          fullName: input.origin.fullName,
          lat: input.origin.lat,
          lng: input.origin.lng,
        }
      : undefined;
  
    const cleanDestination = input.destination
      ? {
          mapboxId: input.destination.mapboxId,
          name: input.destination.name,
          fullName: input.destination.fullName,
          lat: input.destination.lat,
          lng: input.destination.lng,
        }
      : undefined;
  
    if (input.name) {
      const nameExists = await prisma.route.findFirst({
        where: {
          name: { equals: input.name, mode: "insensitive" },
          NOT: { id },
        },
      });
  
      if (nameExists) {
        const error: any = new Error("ROUTE_NAME_EXISTS");
        error.code = "ROUTE_NAME_EXISTS";
        throw error;
      }
    }
  
    if (cleanOrigin && cleanDestination) {
      const origin = await prisma.location.findUnique({
        where: { mapboxId: cleanOrigin.mapboxId },
      });
  
      const destination = await prisma.location.findUnique({
        where: { mapboxId: cleanDestination.mapboxId },
      });
  
      if (origin && destination) {
        const routeExists = await prisma.route.findFirst({
          where: {
            originId: origin.id,
            destinationId: destination.id,
            NOT: { id },
          },
        });
  
        if (routeExists) {
          const error: any = new Error("ROUTE_ORIGIN_DESTINATION_EXISTS");
          error.code = "ROUTE_ORIGIN_DESTINATION_EXISTS";
          throw error;
        }
      }
    }
  
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
              where: { mapboxId: cleanOrigin.mapboxId },
              create: cleanOrigin,
            },
          },
        }),
  
        ...(cleanDestination && {
          destination: {
            connectOrCreate: {
              where: { mapboxId: cleanDestination.mapboxId },
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
