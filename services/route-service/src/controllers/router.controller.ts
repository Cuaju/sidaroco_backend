import { Request, Response } from "express";
import { RouteService } from "../services/route.service";
import { uploadToS3, getSignedUrlForKey } from "../utils/s3"
const isNum = (v: any) => typeof v === "number" && Number.isFinite(v);

export class RouteController {

  static async list(req: Request, res: Response) {
    try {
      const skip = req.query.skip !== undefined
        ? Number(req.query.skip)
        : undefined;
  
      const take = req.query.take !== undefined
        ? Number(req.query.take)
        : undefined;
  
      const q = req.query.q ? String(req.query.q) : undefined;
      const origin = req.query.origin ? String(req.query.origin) : undefined;
      const destination = req.query.destination
        ? String(req.query.destination)
        : undefined;
  
      const featured =
        req.query.featured === "true"
          ? true
          : req.query.featured === "false"
          ? false
          : undefined;
  
      const minPrice =
        req.query.minPrice !== undefined
          ? Number(req.query.minPrice)
          : undefined;
  
      const maxPrice =
        req.query.maxPrice !== undefined
          ? Number(req.query.maxPrice)
          : undefined;
  
      const routes = await RouteService.list({
        skip,
        take,
        q,
        origin,
        destination,
        featured,
        minPrice,
        maxPrice,
      });
  
      for (const route of routes) {
        if (route.photoKey) {
          route.photoKey = await getSignedUrlForKey(route.photoKey);
        }
      }
  
      return res.json(routes);
    } catch (e: any) {
      return res.status(500).json({
        message: "internal error",
        detail: e?.message,
      });
    }
  }
  
  
  static async toggleFeatured(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
  
      if (!Number.isInteger(id)) {
        return res.status(400).json({ message: "invalid id" });
      }

      const route = await RouteService.getById(id);
      if (!route) {
        return res.status(404).json({ message: "not found" });
      }
      const updated = await RouteService.update(id, {
        featured: !route.featured,
      });
  
     
      return res.json(updated);
    } catch (e: any) {
      return res.status(500).json({
        message: "internal error",
        detail: e?.message,
      });
    }
  }
  
  static async getFeatured(req: Request, res: Response) {
  try {
    const routes = await RouteService.getFeatured();

    const out = await Promise.all(
      routes.map(async (r: any) => ({
        ...r,
        photoUrl: r.photoKey ? await getSignedUrlForKey(r.photoKey) : null,
      }))
    );

    return res.json(out);
  } catch (e: any) {
    return res.status(500).json({
      message: "internal error",
      detail: e?.message,
    });
  }
  }
  
  static async getById(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
  
      if (!Number.isInteger(id)) {
        return res.status(400).json({ message: "invalid id" });
      }
  
      const route = await RouteService.getById(id);
      if (!route) {
        return res.status(404).json({ message: "not found" });
      }
      if (route.photoKey) {
        route.photoKey = await getSignedUrlForKey(route.photoKey);
      }
  
      return res.json(route);
    } catch (e: any) {
      return res.status(500).json({
        message: "internal error",
        detail: e?.message,
      });
    }
  }
  
  static async create(req: Request, res: Response) {
    try {
      const { name, ticketPrice, featured } = req.body;
      const origin =
        typeof req.body.origin === "string"
          ? JSON.parse(req.body.origin)
          : req.body.origin;
  
      const destination =
        typeof req.body.destination === "string"
          ? JSON.parse(req.body.destination)
          : req.body.destination;
  
      let photoKey: string | undefined;
  
      if (req.file) {
        photoKey = await uploadToS3(req.file, "routes");
      }
  
      const created = await RouteService.create({
        name,
        ticketPrice: ticketPrice ? Number(ticketPrice) : undefined,
        featured: featured === "true",
        photoKey,
        origin,
        destination,
      });
  
      if (created.photoKey) {
        created.photoKey = await getSignedUrlForKey(created.photoKey);
      }
  
      return res.status(201).json(created);
    } catch (e: any) {
  
      if (e.code === "ROUTE_NAME_EXISTS") {
        return res.status(409).json({
          message: "ROUTE_NAME_EXISTS",
        });
      }
  
      if (e.code === "ROUTE_ORIGIN_DESTINATION_EXISTS") {
        return res.status(409).json({
          message: "ROUTE_ORIGIN_DESTINATION_EXISTS",
        });
      }
  
      return res.status(500).json({
        message: "internal error",
        detail: e?.message,
      });
    }
  }
  
  
  static async update(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      if (!Number.isInteger(id)) {
        return res.status(400).json({ message: "invalid id" });
      }
  
      let photoKey: string | undefined;
      if (req.file) {
        photoKey = await uploadToS3(req.file, "routes");
      }
      const updateData: any = {};
  
      if (req.body.name) updateData.name = req.body.name;
      if (req.body.ticketPrice) updateData.ticketPrice = Number(req.body.ticketPrice);
      
      if (typeof req.body.featured === "boolean") {
        updateData.featured = req.body.featured;
      } else if (req.body.featured === "true" || req.body.featured === "false") {
        updateData.featured = req.body.featured === "true";
      }
  
      if (photoKey) updateData.photoKey = photoKey;
  
      if (req.body.origin) {
        updateData.origin =
          typeof req.body.origin === "string" ? JSON.parse(req.body.origin) : req.body.origin;
      }
  
      if (req.body.destination) {
        updateData.destination =
          typeof req.body.destination === "string"
            ? JSON.parse(req.body.destination)
            : req.body.destination;
      }
  
      const updated = await RouteService.update(id, updateData);
  
      if (updated.photoKey) {
        updated.photoKey = await getSignedUrlForKey(updated.photoKey);
      }
  
      return res.json(updated);
    } catch (e: any) {
      if (e.code === "ROUTE_NAME_EXISTS") {
        return res.status(409).json({ message: "ROUTE_NAME_EXISTS" });
      }
    
      if (e.code === "ROUTE_ORIGIN_DESTINATION_EXISTS") {
        return res.status(409).json({ message: "ROUTE_ORIGIN_DESTINATION_EXISTS" });
      }
    
      return res.status(500).json({
        message: "internal error",
        detail: e?.message,
      });
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
    } catch (e: any) {
      if (String(e?.code) === "P2025") {
        return res.status(404).json({ message: "not found" });
      }

      return res.status(500).json({
        message: "internal error",
        detail: e?.message,
      });
    }
  }
}
