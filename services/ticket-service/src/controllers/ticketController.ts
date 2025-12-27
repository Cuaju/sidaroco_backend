import { Request, Response } from "express";
import * as TicketService from "../services/ticketService";

export async function createTicket(req: Request, res: Response) {
  try {
    const { tripId, userId, seatNumber, price, status, saleDate } = req.body;

    if (!saleDate || isNaN(Date.parse(saleDate))) {
      return res.status(400).json({ message: "Invalid saleDate" });
    }

    const ticketData = {
      tripId: Number(tripId),
      userId: Number(userId),
      seatNumber: Number(seatNumber),
      price: Number(price),
      status: status ?? "ACTIVE",
      saleDate: new Date(saleDate),
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
    const id = Number(req.params.id);
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
    const userId = Number(req.params.userId);
    const tickets = await TicketService.getTicketsByUser(userId);
    res.json(tickets);
  } catch (error) {
    console.error("Error getting tickets by user:", error);
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
    const id = Number(req.params.id);

    const ticketData = {
      tripId: req.body.tripId ? Number(req.body.tripId) : undefined,
      userId: req.body.userId ? Number(req.body.userId) : undefined,
      seatNumber: req.body.seatNumber ? Number(req.body.seatNumber) : undefined,
      price: req.body.price ? Number(req.body.price) : undefined,
      status: req.body.status,
      saleDate: req.body.saleDate ? new Date(req.body.saleDate) : undefined,
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
    const id = Number(req.params.id);
    await TicketService.deleteTicket(id);
    res.status(204).send();
  } catch (error) {
    console.error("Error deleting ticket:", error);
    res.status(500).json({ message: "Failed to delete ticket" });
  }
}
