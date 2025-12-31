import { Request, Response } from "express";
import { uploadToS3,getSignedUrlForKey  } from "../utils/s3";
import * as BusService from "../services/bus.service";

type RouteDTO = { id: string };

async function httpGetJson<T>(
  url: string,
  req: Request
): Promise<{ status: number; json?: T }> {
  const authHeader = req.header("authorization");

  const headers: Record<string, string> = {
    ...(authHeader ? { Authorization: authHeader } : {}),
  };

  const res = await fetch(url, { headers });

  if (!res.ok) return { status: res.status };
  const json = (await res.json()) as T;
  return { status: res.status, json };
}

export async function createBus(req: Request, res: Response) {
  try {
    let photoKey: string = "";
    let routeID: number = 0;

    if (req.file) {
      photoKey = await uploadToS3(req.file, "buses");
    }

    if (req.body.routeId) {
      routeID = parseInt(req.body.routeId);
    }

    if (routeID) {
      const ROUTE_SERVICE_URL = process.env.ROUTE_SERVICE_URL || "http://localhost:3001";
      const routeResp = await httpGetJson<RouteDTO>(`${ROUTE_SERVICE_URL}/routes/${routeID}`, req);
      
      if (routeResp.status === 404) {
        return res.status(400).json({ message: "routeId not found" });
      }
      if (routeResp.status >= 400) {
        return res.status(502).json({ message: "Failed to validate routeId" });
      }
    }

    const busData = {
      name: req.body.name,
      model: req.body.model,
      vin: req.body.vin,
      plateNumber: req.body.plateNumber,
      capacity: parseInt(req.body.capacity),
      status: req.body.status,
      photoKey: photoKey,
      routeId: routeID,
    };

    const newBus = await BusService.createBus(busData);

    newBus.photoKey = await getSignedUrlForKey(newBus.photoKey);

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


    if (bus == null) {
      return res.status(404).json({ message: "Bus not found" });
    }

    if (bus.photoKey) {
      bus.photoKey = await getSignedUrlForKey(bus.photoKey);
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

    const realBuses = await Promise.all(buses.map(async (bus) => ({
      id: bus.id,
      name: bus.name,
      model: bus.model,
      vin: bus.vin,
      plateNumber: bus.plateNumber,
      capacity: bus.capacity,
      status: bus.status,
      routeId: bus.routeId,
      photoKey: bus.photoKey ? await getSignedUrlForKey(bus.photoKey) : bus.photoKey,
    })));

    res.json(realBuses);
  } catch (error) {
    console.error("Error getting buses:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function updateBus(req: Request, res: Response) {
  try {
    const id = parseInt(req.params.id);
    let photoKey: string | undefined;
    let routeID: number | undefined;

    if (req.file) {
      photoKey = await uploadToS3(req.file, "buses");
    }    if (req.body.routeId) {
      routeID = parseInt(req.body.routeId);
    }

    if (routeID) {
      const ROUTE_SERVICE_URL = process.env.ROUTE_SERVICE_URL || "http://localhost:3001";
      const routeResp = await httpGetJson<RouteDTO>(`${ROUTE_SERVICE_URL}/routes/${routeID}`, req);
      
      if (routeResp.status === 404) {
        return res.status(400).json({ message: "routeId not found" });
      }
      if (routeResp.status >= 400) {
        return res.status(502).json({ message: "Failed to validate routeId" });
      }
    }

    const busData: any = {
      name: req.body.name,
      model: req.body.model,
      vin: req.body.vin,
      plateNumber: req.body.plateNumber,
      capacity: req.body.capacity ? parseInt(req.body.capacity) : undefined,
      status: req.body.status,
      photoKey: photoKey,
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