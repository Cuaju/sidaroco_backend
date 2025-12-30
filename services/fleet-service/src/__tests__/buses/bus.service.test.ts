import { prismaMock } from "../setup";
import * as BusService from "../../services/bus.service";

const mockBus = {
  id: 1,
  name: "Bus 101",
  model: "Mercedes Sprinter",
  vin: "1HGBH41JXMN109186",
  plateNumber: "ABC-1234",
  capacity: 50,
  status: "available",
  photoKey: "",
  routeId: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe("Bus Service", () => {
  describe("createBus", () => {
    it("should create a new bus", async () => {
      const inputData = {
        name: "Bus 101",
        model: "Mercedes Sprinter",
        vin: "1HGBH41JXMN109186",
        plateNumber: "ABC-1234",
        capacity: 50,
        status: "available",
        photoKey: "",
        routeId: null,
      };

      prismaMock.bus.create.mockResolvedValue(mockBus);

      const result = await BusService.createBus(inputData);

      expect(result).toEqual(mockBus);
      expect(prismaMock.bus.create).toHaveBeenCalledWith({
        data: inputData,
      });
    });

    it("should throw error when VIN already exists", async () => {
      prismaMock.bus.create.mockRejectedValue(new Error("Unique constraint failed"));

      await expect(
        BusService.createBus({
          name: "Test Bus",
          model: "Test Model",
          vin: "1HGBH41JXMN109186", // duplicate
          plateNumber: "NEW-1234",
          capacity: 30,
          status: "available",
          photoKey: "",
          routeId: null,
        })
      ).rejects.toThrow("Unique constraint failed");
    });
  });

  describe("getBusById", () => {
    it("should return a bus when found", async () => {
      prismaMock.bus.findUnique.mockResolvedValue(mockBus);

      const result = await BusService.getBusById(1);

      expect(result).toEqual(mockBus);
      expect(prismaMock.bus.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });

    it("should return null when bus not found", async () => {
      prismaMock.bus.findUnique.mockResolvedValue(null);

      const result = await BusService.getBusById(999);

      expect(result).toBeNull();
    });
  });

  describe("getAllBuses", () => {
    it("should return all buses", async () => {
      const buses = [mockBus, { ...mockBus, id: 2, name: "Bus 202" }];
      prismaMock.bus.findMany.mockResolvedValue(buses);

      const result = await BusService.getAllBuses();

      expect(result).toHaveLength(2);
      expect(prismaMock.bus.findMany).toHaveBeenCalledTimes(1);
    });

    it("should return empty array when no buses", async () => {
      prismaMock.bus.findMany.mockResolvedValue([]);

      const result = await BusService.getAllBuses();

      expect(result).toEqual([]);
    });
  });

  describe("updateBus", () => {
    it("should update a bus", async () => {
      const updatedBus = { ...mockBus, name: "Bus Updated" };
      prismaMock.bus.update.mockResolvedValue(updatedBus);

      const result = await BusService.updateBus(1, { name: "Bus Updated" });

      expect(result.name).toBe("Bus Updated");
      expect(prismaMock.bus.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { name: "Bus Updated" },
      });
    });

    it("should throw error when bus not found", async () => {
      prismaMock.bus.update.mockRejectedValue(new Error("Record not found"));

      await expect(
        BusService.updateBus(999, { name: "Updated" })
      ).rejects.toThrow("Record not found");
    });
  });

  describe("deleteBus", () => {
    it("should delete a bus", async () => {
      prismaMock.bus.delete.mockResolvedValue(mockBus);

      const result = await BusService.deleteBus(1);

      expect(result).toEqual(mockBus);
      expect(prismaMock.bus.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });

    it("should throw error when bus not found", async () => {
      prismaMock.bus.delete.mockRejectedValue(new Error("Record not found"));

      await expect(BusService.deleteBus(999)).rejects.toThrow("Record not found");
    });
  });
});
