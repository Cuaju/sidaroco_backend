import { Ticket } from "../generated/prisma/client";
import prisma from "../db/prisma";

export async function createTicket(
  data: Omit<Ticket, "id" | "createdAt" | "updatedAt">
): Promise<Ticket> {
  return prisma.ticket.create({
    data,
  });
}

export async function getTicketById(id: number): Promise<Ticket | null> {
  return prisma.ticket.findUnique({
    where: { id },
  });
}

export async function getTicketsByUser(userId: number): Promise<Ticket[]> {
  return prisma.ticket.findMany({
    where: { userId },
  });
}

export async function getTicketsByRoute(routeId: number): Promise<Ticket[]> {
  return prisma.ticket.findMany({
    where: { routeId },
  });
}

export async function getAllTickets(): Promise<Ticket[]> {
  return prisma.ticket.findMany();
}

export async function updateTicket(
  id: number,
  data: Partial<Omit<Ticket, "id">>
): Promise<Ticket> {
  return prisma.ticket.update({
    where: { id },
    data,
  });
}

export async function deleteTicket(id: number): Promise<Ticket> {
  return prisma.ticket.delete({
    where: { id },
  });
}
