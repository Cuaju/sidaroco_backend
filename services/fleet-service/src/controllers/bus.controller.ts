import { Request, Response } from "express";
import { uploadToS3 } from "../utils/s3";
import * as BusService from "../services/bus.service";

export async function createDriver(req: Request, res: Response) {
  try {
    let photoUrl: string = "";
    let routeID: number = 0;

    if (req.file) {
      photoUrl = await uploadToS3(req.file, "buses");
    }

    if (req.body.routeID) {
      routeID = parseInt(req.body.routeID);
    }

    //TODO:
    //here check if the routeID exists in the database if routeID is provided, if not, return 400 error

    const busData = {
      name: req.body.name,
      model: req.body.model,
      vin: req.body.vin,
      plateNumber: req.body.plateNumber,
      capacity: parseInt(req.body.capacity),
      status: req.body.status,
      photoUrl: photoUrl,
      routeId: routeID,
    };

    const newBus = await BusService.createBus(busData);
    res.status(201).json(newBus);
  } catch (error) {
    console.error("Error creating bus:", error);
    res.status(500).json({ message: "Failed to create the bus" });
  }
}

export async function getBusById(req: Request, res: Response) {
  try {
    const id = parseInt(req.params.id);
    const bus = await BusService.getBusById(id);

    if (!bus) {
      return res.status(404).json({ message: "Bus not found" });
    }

    res.json(bus);
  } catch (error) {
    console.error("Error getting bus:", error);
    res.status(500).json({ message: "Failed to get bus" });
  }
}

export async function getAllBuses(req: Request, res: Response) {
  try {
    const buses = await BusService.getAllBuses();
    res.json(buses);
  } catch (error) {
    console.error("Error getting buses:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function updateBus(req: Request, res: Response) {
  try {
    const id = parseInt(req.params.id);
    let photoUrl: string | undefined;
    let routeID: number | undefined;

    if (req.file) {
      photoUrl = await uploadToS3(req.file, "buses");
    }

    if (req.body.routeID) {
      routeID = parseInt(req.body.routeID);
    }

    //TODO:
    //here check if the routeID exists in the database if routeID is provided, if not, return 400 error


    const busData: any = {
      name: req.body.name,
      model: req.body.model,
      vin: req.body.vin,
      plateNumber: req.body.plateNumber,
      capacity: req.body.capacity ? parseInt(req.body.capacity) : undefined,
      status: req.body.status,
      photoUrl: photoUrl,
      routeId: routeID,
    };

    const updatedBus = await BusService.updateBus(id, busData);

    if (!updatedBus) {
      return res.status(404).json({ message: "Bus not found" });
    }

    res.json(updatedBus);
  } catch (error) {
    console.error("Error updating bus:", error);
    res.status(500).json({ message: "Failed to update bus" });
  }
}

export async function deleteBus(req: Request, res: Response) {
  try {
    const id = parseInt(req.params.id);
    await BusService.deleteBus(id);
    res.status(204).send();
  } catch (error) {
    console.error("Error deleting bus:", error);
    res.status(500).json({ message: "Failed to delete bus" });
  }
}