import { Request, Response } from "express";
import * as TicketService from "../services/ticketService";

export async function createTicket(req: Request, res: Response) {
  try {
    const { routeId, userId, price, status } = req.body;

    const ticketData = {
      routeId: parseInt(routeId),
      userId: parseInt(userId),
      price: parseFloat(price),
      status: status ?? "ACTIVE",
    };

    const newTicket = await TicketService.createTicket(ticketData);
    res.status(201).json(newTicket);
  } catch (error) {
    console.error("Error creating ticket:", error);
    res.status(500).json({ message: "Failed to create ticket" });
  }
}

export async function getTicketById(req: Request, res: Response) {
  try {
    const id = parseInt(req.params.id);
    const ticket = await TicketService.getTicketById(id);

    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    res.json(ticket);
  } catch (error) {
    console.error("Error getting ticket:", error);
    res.status(500).json({ message: "Failed to get ticket" });
  }
}

export async function getTicketsByUser(req: Request, res: Response) {
  try {
    const userId = parseInt(req.params.userId);
    const tickets = await TicketService.getTicketsByUser(userId);
    res.json(tickets);
  } catch (error) {
    console.error("Error getting tickets by user:", error);
    res.status(500).json({ message: "Failed to get tickets" });
  }
}

export async function getTicketsByRoute(req: Request, res: Response) {
  try {
    const routeId = parseInt(req.params.routeId);
    const tickets = await TicketService.getTicketsByRoute(routeId);
    res.json(tickets);
  } catch (error) {
    console.error("Error getting tickets by route:", error);
    res.status(500).json({ message: "Failed to get tickets" });
  }
}

export async function getAllTickets(req: Request, res: Response) {
  try {
    const tickets = await TicketService.getAllTickets();
    res.json(tickets);
  } catch (error) {
    console.error("Error getting tickets:", error);
    res.status(500).json({ message: "Failed to get tickets" });
  }
}

export async function updateTicket(req: Request, res: Response) {
  try {
    const id = parseInt(req.params.id);

    const ticketData: any = {
      routeId: req.body.routeId ? parseInt(req.body.routeId) : undefined,
      userId: req.body.userId ? parseInt(req.body.userId) : undefined,
      price: req.body.price ? parseFloat(req.body.price) : undefined,
      status: req.body.status,
    };

    const updatedTicket = await TicketService.updateTicket(id, ticketData);
    res.json(updatedTicket);
  } catch (error) {
    console.error("Error updating ticket:", error);
    res.status(500).json({ message: "Failed to update ticket" });
  }
}

export async function deleteTicket(req: Request, res: Response) {
  try {
    const id = parseInt(req.params.id);
    await TicketService.deleteTicket(id);
    res.status(204).send();
  } catch (error) {
    console.error("Error deleting ticket:", error);
    res.status(500).json({ message: "Failed to delete ticket" });
  }
}
