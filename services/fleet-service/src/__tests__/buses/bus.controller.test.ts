import request from "supertest";
import app from "../../app";
import { prismaMock } from "../setup";

const mockBus = {
  id: 1,
  name: "Bus 101",
  model: "Mercedes Sprinter",
  vin: "1HGBH41JXMN109186",
  plateNumber: "ABC-1234",
  capacity: 50,
  status: "available",
  photoUrl: "",
  routeId: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe("Bus Controller", () => {
  describe("GET /buses", () => {
    it("should return 401 without auth headers", async () => {
      const res = await request(app).get("/buses");
      
      expect(res.status).toBe(401);
      expect(res.body.message).toBe("Unauthorized");
    });

    it("should return all buses with auth headers", async () => {
      prismaMock.bus.findMany.mockResolvedValue([mockBus]);

      const res = await request(app)
        .get("/buses")
        .set("x-user-id", "1")
        .set("x-user-role", "admin");

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body).toHaveLength(1);
      expect(res.body[0].name).toBe("Bus 101");
    });

    it("should return empty array when no buses exist", async () => {
      prismaMock.bus.findMany.mockResolvedValue([]);

      const res = await request(app)
        .get("/buses")
        .set("x-user-id", "1")
        .set("x-user-role", "admin");

      expect(res.status).toBe(200);
      expect(res.body).toEqual([]);
    });
  });

  describe("GET /buses/:id", () => {
    it("should return 401 without auth headers", async () => {
      const res = await request(app).get("/buses/1");
      
      expect(res.status).toBe(401);
    });

    it("should return a bus by id", async () => {
      prismaMock.bus.findUnique.mockResolvedValue(mockBus);

      const res = await request(app)
        .get("/buses/1")
        .set("x-user-id", "1")
        .set("x-user-role", "admin");

      expect(res.status).toBe(200);
      expect(res.body.id).toBe(1);
      expect(res.body.name).toBe("Bus 101");
    });

    it("should return 404 when bus not found", async () => {
      prismaMock.bus.findUnique.mockResolvedValue(null);

      const res = await request(app)
        .get("/buses/999")
        .set("x-user-id", "1")
        .set("x-user-role", "admin");

      expect(res.status).toBe(404);
      expect(res.body.message).toBe("Bus not found");
    });
  });

  describe("POST /buses", () => {
    it("should return 401 without auth headers", async () => {
      const res = await request(app)
        .post("/buses")
        .send({ name: "Test Bus" });
      
      expect(res.status).toBe(401);
    });

    it("should create a new bus", async () => {
      const newBus = {
        name: "Bus 202",
        model: "Volvo 9700",
        vin: "2HGBH41JXMN109187",
        plateNumber: "XYZ-5678",
        capacity: 45,
        status: "available",
      };

      prismaMock.bus.create.mockResolvedValue({
        id: 2,
        ...newBus,
        photoUrl: "",
        routeId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const res = await request(app)
        .post("/buses")
        .set("x-user-id", "1")
        .set("x-user-role", "admin")
        .send(newBus);

      expect(res.status).toBe(201);
      expect(res.body.id).toBe(2);
      expect(res.body.name).toBe("Bus 202");
      expect(prismaMock.bus.create).toHaveBeenCalledTimes(1);
    });

    it("should return 500 on database error", async () => {
      prismaMock.bus.create.mockRejectedValue(new Error("DB Error"));

      const res = await request(app)
        .post("/buses")
        .set("x-user-id", "1")
        .set("x-user-role", "admin")
        .send({
          name: "Test Bus",
          model: "Test Model",
          vin: "TEST123456789",
          plateNumber: "TEST-1234",
          capacity: 30,
          status: "available",
        });

      expect(res.status).toBe(500);
      expect(res.body.message).toBe("Failed to create the bus");
    });
  });

  describe("PUT /buses/:id", () => {
    it("should return 401 without auth headers", async () => {
      const res = await request(app)
        .put("/buses/1")
        .send({ name: "Updated Bus" });
      
      expect(res.status).toBe(401);
    });

    it("should update an existing bus", async () => {
      const updatedBus = { ...mockBus, name: "Bus Updated" };
      prismaMock.bus.update.mockResolvedValue(updatedBus);

      const res = await request(app)
        .put("/buses/1")
        .set("x-user-id", "1")
        .set("x-user-role", "admin")
        .send({ name: "Bus Updated" });

      expect(res.status).toBe(200);
      expect(res.body.name).toBe("Bus Updated");
      expect(prismaMock.bus.update).toHaveBeenCalledTimes(1);
    });

    it("should return 500 on database error", async () => {
      prismaMock.bus.update.mockRejectedValue(new Error("DB Error"));

      const res = await request(app)
        .put("/buses/1")
        .set("x-user-id", "1")
        .set("x-user-role", "admin")
        .send({ name: "Updated" });

      expect(res.status).toBe(500);
      expect(res.body.message).toBe("Failed to update bus");
    });
  });

  describe("DELETE /buses/:id", () => {
    it("should return 401 without auth headers", async () => {
      const res = await request(app).delete("/buses/1");
      
      expect(res.status).toBe(401);
    });

    it("should delete a bus", async () => {
      prismaMock.bus.delete.mockResolvedValue(mockBus);

      const res = await request(app)
        .delete("/buses/1")
        .set("x-user-id", "1")
        .set("x-user-role", "admin");

      expect(res.status).toBe(204);
      expect(prismaMock.bus.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });

    it("should return 500 on database error", async () => {
      prismaMock.bus.delete.mockRejectedValue(new Error("DB Error"));

      const res = await request(app)
        .delete("/buses/1")
        .set("x-user-id", "1")
        .set("x-user-role", "admin");

      expect(res.status).toBe(500);
      expect(res.body.message).toBe("Failed to delete bus");
    });
  });
});
