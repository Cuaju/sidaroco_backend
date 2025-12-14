import { Bus } from "../generated/prisma/client";
import prisma from "../db/prisma";

export async function createBus(data:Omit<Bus,"id" | "createdAt" | "updatedAt">): Promise<Bus> {
    const newBus = await prisma.bus.create({
        data
    });
    return newBus; 
}

export async function getBusById(id:number): Promise<Bus | null> {
    const bus = await prisma.bus.findUnique({
        where: { id }
    });
    return bus;
}

export async function getAllBuses(): Promise<Bus[]> {
    const buses = await prisma.bus.findMany();
    return buses;
}

export async function updateBus(id:number, data:Partial<Omit<Bus,"id">>): Promise<Bus> {
    const updatedBus = await prisma.bus.update({
        where: { id },
        data
    });
    return updatedBus; 
}

export async function deleteBus(id:number): Promise<Bus> {
    const deletedBus = await prisma.bus.delete({
        where: { id }
    });
    return deletedBus; 
}