import request from "supertest";
import app from "../../app";
import { prismaMock } from "../setup";

const mockDriver = {
  id: 1,
  name: "John Doe",
  licenseNumber: "ABC123",
  birdthDate: new Date("1990-01-01"),
  address: "123 Test Street",
  status: "available",
  photoUrl: "",
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe("Driver Controller", () => {
  describe("GET /drivers", () => {
    it("should return 401 without auth headers", async () => {
      const res = await request(app).get("/drivers");
      
      expect(res.status).toBe(401);
      expect(res.body.message).toBe("Unauthorized");
    });

    it("should return all drivers with auth headers", async () => {
      prismaMock.driver.findMany.mockResolvedValue([mockDriver]);

      const res = await request(app)
        .get("/drivers")
        .set("x-user-id", "1")
        .set("x-user-role", "admin");

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body).toHaveLength(1);
      expect(res.body[0].name).toBe("John Doe");
    });

    it("should return empty array when no drivers exist", async () => {
      prismaMock.driver.findMany.mockResolvedValue([]);

      const res = await request(app)
        .get("/drivers")
        .set("x-user-id", "1")
        .set("x-user-role", "admin");

      expect(res.status).toBe(200);
      expect(res.body).toEqual([]);
    });
  });

  describe("GET /drivers/:id", () => {
    it("should return 401 without auth headers", async () => {
      const res = await request(app).get("/drivers/1");
      
      expect(res.status).toBe(401);
    });

    it("should return a driver by id", async () => {
      prismaMock.driver.findUnique.mockResolvedValue(mockDriver);

      const res = await request(app)
        .get("/drivers/1")
        .set("x-user-id", "1")
        .set("x-user-role", "admin");

      expect(res.status).toBe(200);
      expect(res.body.id).toBe(1);
      expect(res.body.name).toBe("John Doe");
    });

    it("should return 404 when driver not found", async () => {
      prismaMock.driver.findUnique.mockResolvedValue(null);

      const res = await request(app)
        .get("/drivers/999")
        .set("x-user-id", "1")
        .set("x-user-role", "admin");

      expect(res.status).toBe(404);
      expect(res.body.message).toBe("Driver not found");
    });
  });

  describe("POST /drivers", () => {
    it("should return 401 without auth headers", async () => {
      const res = await request(app)
        .post("/drivers")
        .send({ name: "Test" });
      
      expect(res.status).toBe(401);
    });

    it("should create a new driver", async () => {
      const newDriver = {
        name: "Jane Doe",
        licenseNumber: "XYZ789",
        birdthDate: "1995-05-15T00:00:00.000Z",
        address: "456 New Street",
        status: "available",
      };

      prismaMock.driver.create.mockResolvedValue({
        id: 2,
        ...newDriver,
        birdthDate: new Date(newDriver.birdthDate),
        photoUrl: "",
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const res = await request(app)
        .post("/drivers")
        .set("x-user-id", "1")
        .set("x-user-role", "admin")
        .send(newDriver);

      expect(res.status).toBe(201);
      expect(res.body.id).toBe(2);
      expect(res.body.name).toBe("Jane Doe");
      expect(prismaMock.driver.create).toHaveBeenCalledTimes(1);
    });

    it("should return 500 on database error", async () => {
      prismaMock.driver.create.mockRejectedValue(new Error("DB Error"));

      const res = await request(app)
        .post("/drivers")
        .set("x-user-id", "1")
        .set("x-user-role", "admin")
        .send({
          name: "Test",
          licenseNumber: "TEST123",
          birdthDate: "1990-01-01",
          address: "Test Address",
          status: "available",
        });

      expect(res.status).toBe(500);
      expect(res.body.message).toBe("Failed to create the driver");
    });
  });

  describe("PUT /drivers/:id", () => {
    it("should return 401 without auth headers", async () => {
      const res = await request(app)
        .put("/drivers/1")
        .send({ name: "Updated" });
      
      expect(res.status).toBe(401);
    });

    it("should update an existing driver", async () => {
      const updatedDriver = { ...mockDriver, name: "John Updated" };
      prismaMock.driver.update.mockResolvedValue(updatedDriver);

      const res = await request(app)
        .put("/drivers/1")
        .set("x-user-id", "1")
        .set("x-user-role", "admin")
        .send({ name: "John Updated" });

      expect(res.status).toBe(200);
      expect(res.body.name).toBe("John Updated");
      expect(prismaMock.driver.update).toHaveBeenCalledTimes(1);
    });

    it("should return 500 on database error", async () => {
      prismaMock.driver.update.mockRejectedValue(new Error("DB Error"));

      const res = await request(app)
        .put("/drivers/1")
        .set("x-user-id", "1")
        .set("x-user-role", "admin")
        .send({ name: "Updated" });

      expect(res.status).toBe(500);
      expect(res.body.message).toBe("Failed to update driver");
    });
  });

  describe("DELETE /drivers/:id", () => {
    it("should return 401 without auth headers", async () => {
      const res = await request(app).delete("/drivers/1");
      
      expect(res.status).toBe(401);
    });

    it("should delete a driver", async () => {
      prismaMock.driver.delete.mockResolvedValue(mockDriver);

      const res = await request(app)
        .delete("/drivers/1")
        .set("x-user-id", "1")
        .set("x-user-role", "admin");

      expect(res.status).toBe(204);
      expect(prismaMock.driver.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });

    it("should return 500 on database error", async () => {
      prismaMock.driver.delete.mockRejectedValue(new Error("DB Error"));

      const res = await request(app)
        .delete("/drivers/1")
        .set("x-user-id", "1")
        .set("x-user-role", "admin");

      expect(res.status).toBe(500);
      expect(res.body.message).toBe("Failed to delete driver");
    });
  });
});
