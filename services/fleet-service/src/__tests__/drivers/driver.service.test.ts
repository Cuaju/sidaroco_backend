import { prismaMock } from "../setup";
import * as DriverService from "../../services/driver.service";

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

describe("Driver Service", () => {
  describe("createDriver", () => {
    it("should create a new driver", async () => {
      const inputData = {
        name: "John Doe",
        licenseNumber: "ABC123",
        birdthDate: new Date("1990-01-01"),
        address: "123 Test Street",
        status: "available",
        photoUrl: "",
      };

      prismaMock.driver.create.mockResolvedValue(mockDriver);

      const result = await DriverService.createDriver(inputData);

      expect(result).toEqual(mockDriver);
      expect(prismaMock.driver.create).toHaveBeenCalledWith({
        data: inputData,
      });
    });

    it("should throw error when creation fails", async () => {
      prismaMock.driver.create.mockRejectedValue(new Error("Unique constraint failed"));

      await expect(
        DriverService.createDriver({
          name: "Test",
          licenseNumber: "ABC123", // duplicate
          birdthDate: new Date(),
          address: "Test",
          status: "available",
          photoUrl: "",
        })
      ).rejects.toThrow("Unique constraint failed");
    });
  });

  describe("getDriverById", () => {
    it("should return a driver when found", async () => {
      prismaMock.driver.findUnique.mockResolvedValue(mockDriver);

      const result = await DriverService.getDriverById(1);

      expect(result).toEqual(mockDriver);
      expect(prismaMock.driver.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });

    it("should return null when driver not found", async () => {
      prismaMock.driver.findUnique.mockResolvedValue(null);

      const result = await DriverService.getDriverById(999);

      expect(result).toBeNull();
    });
  });

  describe("getAllDrivers", () => {
    it("should return all drivers", async () => {
      const drivers = [mockDriver, { ...mockDriver, id: 2, name: "Jane Doe" }];
      prismaMock.driver.findMany.mockResolvedValue(drivers);

      const result = await DriverService.getAllDrivers();

      expect(result).toHaveLength(2);
      expect(prismaMock.driver.findMany).toHaveBeenCalledTimes(1);
    });

    it("should return empty array when no drivers", async () => {
      prismaMock.driver.findMany.mockResolvedValue([]);

      const result = await DriverService.getAllDrivers();

      expect(result).toEqual([]);
    });
  });

  describe("updateDriver", () => {
    it("should update a driver", async () => {
      const updatedDriver = { ...mockDriver, name: "John Updated" };
      prismaMock.driver.update.mockResolvedValue(updatedDriver);

      const result = await DriverService.updateDriver(1, { name: "John Updated" });

      expect(result.name).toBe("John Updated");
      expect(prismaMock.driver.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { name: "John Updated" },
      });
    });

    it("should throw error when driver not found", async () => {
      prismaMock.driver.update.mockRejectedValue(new Error("Record not found"));

      await expect(
        DriverService.updateDriver(999, { name: "Updated" })
      ).rejects.toThrow("Record not found");
    });
  });

  describe("deleteDriver", () => {
    it("should delete a driver", async () => {
      prismaMock.driver.delete.mockResolvedValue(mockDriver);

      const result = await DriverService.deleteDriver(1);

      expect(result).toEqual(mockDriver);
      expect(prismaMock.driver.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });

    it("should throw error when driver not found", async () => {
      prismaMock.driver.delete.mockRejectedValue(new Error("Record not found"));

      await expect(DriverService.deleteDriver(999)).rejects.toThrow("Record not found");
    });
  });
});
