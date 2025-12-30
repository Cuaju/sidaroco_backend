import { Request, Response } from "express";
import { RouteService } from "../services/route.service";

const isNum = (v: any) => typeof v === "number" && Number.isFinite(v);

export class RouteController {
  static async list(req: Request, res: Response) {
    try {
      const skip = req.query.skip ? Number(req.query.skip) : 0;
      const take = req.query.take ? Number(req.query.take) : 50;
      const q = req.query.q ? String(req.query.q) : undefined;

      const routes = await RouteService.list({ skip, take, q });
      return res.json(routes);
    } catch (e: any) {
      return res.status(500).json({ message: "internal error", detail: e?.message });
    }
  }
  static async update(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      const { name, origin, destination } = req.body ?? {};
  
      if (!Number.isInteger(id)) {
        return res.status(400).json({ message: "invalid id" });
      }
  
      if (!name) return res.status(400).json({ message: "name is required" });
  
      if (!origin?.name) return res.status(400).json({ message: "origin.name is required" });
      if (!isNum(origin?.lat)) return res.status(400).json({ message: "origin.lat must be number" });
      if (!isNum(origin?.lng)) return res.status(400).json({ message: "origin.lng must be number" });
  
      if (!destination?.name)
        return res.status(400).json({ message: "destination.name is required" });
      if (!isNum(destination?.lat))
        return res.status(400).json({ message: "destination.lat must be number" });
      if (!isNum(destination?.lng))
        return res.status(400).json({ message: "destination.lng must be number" });
  
      const updated = await RouteService.update(id, { name, origin, destination });
      return res.json(updated);
    } catch (e: any) {
      if (String(e?.code) === "P2025") {
        return res.status(404).json({ message: "not found" });
      }
      return res.status(500).json({ message: "internal error", detail: e?.message });
    }
  }
  

  static async getById(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);

      if (!Number.isInteger(id)) {
        return res.status(400).json({ message: "invalid id" });
      }
      
      const route = await RouteService.getById(id);
      if (!route) return res.status(404).json({ message: "not found" });
      return res.json(route);
    } catch (e: any) {
      return res.status(500).json({ message: "internal error", detail: e?.message });
    }
  }

  static async create(req: Request, res: Response) {
    try {
      const { name, origin, destination } = req.body ?? {};

      if (!name) return res.status(400).json({ message: "name is required" });

      if (!origin?.name) return res.status(400).json({ message: "origin.name is required" });
      if (!isNum(origin?.lat)) return res.status(400).json({ message: "origin.lat must be number" });
      if (!isNum(origin?.lng)) return res.status(400).json({ message: "origin.lng must be number" });

      if (!destination?.name) return res.status(400).json({ message: "destination.name is required" });
      if (!isNum(destination?.lat)) return res.status(400).json({ message: "destination.lat must be number" });
      if (!isNum(destination?.lng)) return res.status(400).json({ message: "destination.lng must be number" });

      const created = await RouteService.create({ name, origin, destination });
      return res.status(201).json(created);
    } catch (e: any) {
      console.error(e);
      if (e?.code === "P2002") {
        return res.status(409).json({
          message: "route already exists (same origin and destination)",
        });
      }
      return res.status(500).json({ message: "internal error", detail: e?.message });
      return res.status(500).json({ message: "internal error", detail: e?.message });
      
    }
  }

  static async remove(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);

      if (!Number.isInteger(id)) {
        return res.status(400).json({ message: "invalid id" });
      }
      
      await RouteService.remove(id);
      return res.status(204).send();
      
      return res.status(204).send();
    } catch (e: any) {
      if (String(e?.code) === "P2025") return res.status(404).json({ message: "not found" });
      return res.status(500).json({ message: "internal error", detail: e?.message });
    }
  }
}
