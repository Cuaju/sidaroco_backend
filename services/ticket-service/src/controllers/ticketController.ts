import { Request, Response } from "express";
import * as TicketService from "../services/ticketService";
import { sendTicketEmail } from "../utils/mailClient";
import prisma from "../db/prisma";

export async function createTicket(req: Request, res: Response) {
  try {
    const { tripId, userId, seatNumber, price, status, saleDate, passengerName, paymentMethod } = req.body;

    if (!saleDate || isNaN(Date.parse(saleDate))) {
      return res.status(400).json({ message: "Invalid saleDate" });
    }

    const ticketData = {
      tripId: Number(tripId),
      userId: String(userId),
      seatNumber: Number(seatNumber),
      price: Number(price),
      status: status ?? "ACTIVE",
      saleDate: new Date(saleDate),
      passengerName: passengerName ?? null,
      paymentMethod: paymentMethod ?? null,
    };

    const existing = await prisma.ticket.findFirst({
      where: {
        tripId: Number(tripId),
        seatNumber: Number(seatNumber),
      },
    });


    if (existing) {
      return res.status(409).json({ message: "Seat already sold" });
    }

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
    const userId = String(req.params.userId);
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
      userId: req.body.userId ? String(req.body.userId) : undefined,
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

export async function sendTicketsEmail(req: Request, res: Response){
  try{
    const {to, routeName, travelDate, travelTime, tickets, passengerName, totalPrice} = req.body;

    if(!to || typeof to !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)){
      return res.status(400).json({message: "Invalid email address"});
    }

    if (!to || !routeName || !travelDate || !travelTime || !tickets || !totalPrice) {
      return res.status(400).json({message: "Missing required fields"});
    }

    await sendTicketEmail(to, {routeName, travelDate, travelTime, tickets, passengerName: passengerName || "Guest", totalPrice: totalPrice || 0});

    return res.status(200).json({success: true, message: "Tickets email sent successfully"});

  } catch (error: any) {
    console.error("Error sending tickets email:", error);
    res.status(500).json({message: error.message || "Failed to send tickets email"});
  }
}
