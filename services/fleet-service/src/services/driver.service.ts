import { Driver } from "../generated/prisma/client";
import prisma from "../db/prisma";

export async function createDriver(data:Omit<Driver,"id" | "createdAt" | "updatedAt">): Promise<Driver> {
    const newDriver = await prisma.driver.create({
        data
    });
    return newDriver; 
}

export async function getDriverById(id:number): Promise<Driver | null> {
    const driver = await prisma.driver.findUnique({
        where: { id }
    });
    return driver;
}

export async function getDriverByAccountId(accountId: string): Promise<Driver | null> {
    const driver = await prisma.driver.findFirst({
        where: { accountId }
    });
    return driver;
}

export async function getAllDrivers(): Promise<Driver[]> {
    const drivers = await prisma.driver.findMany();
    return drivers;
}

export async function updateDriver(id:number, data:Partial<Omit<Driver,"id">>): Promise<Driver> {
    const updatedDriver = await prisma.driver.update({
        where: { id },
        data
    });
    return updatedDriver; 
}

export async function deleteDriver(id:number): Promise<Driver> {
    const deletedDriver = await prisma.driver.delete({
        where: { id }
    });
    return deletedDriver; 
}