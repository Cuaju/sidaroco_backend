import  {Request, Response} from "express";
import { uploadToS3, getSignedUrlForKey } from "../utils/s3";
import * as DriverService from "../services/driver.service";

const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || "http://authentication-service:3000";

function generateDriverEmail(name: string): string {
  return name.toLowerCase().replace(/\s+/g, '') + "@sidaroco.com";
}

function generateDriverPassword(licenseNumber: string): string {
  return licenseNumber + "$";
}

async function createDriverAccount(name: string, licenseNumber: string): Promise<{ accountId: string } | null> {
  const email = generateDriverEmail(name);
  const username = name.toLowerCase().replace(/\s+/g, '_');
  const password = generateDriverPassword(licenseNumber);

  try {
    const response = await fetch(`${AUTH_SERVICE_URL}/internal/newAccount`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        newEmail: email,
        newUsername: username,
        newPassword: password,
        userType: "Driver"
      })
    });

    if (response.status === 201) {
      const data = await response.json();
      return { accountId: data.accountId };
    }
    
    console.error("Failed to create driver account:", await response.text());
    return null;
  } catch (error) {
    console.error("Error calling auth service:", error);
    return null;
  }
}

export async function createDriver(req:Request, res:Response) {

    try{
        let photoKey: string = "";

        if (req.file) {
            photoKey = await uploadToS3(req.file, "drivers");
        }

        // Create driver account first
        const accountResult = await createDriverAccount(req.body.name, req.body.licenseNumber);
        
        if (!accountResult) {
          return res.status(500).json({ message: "Failed to create driver account" });
        }

        const driverData = {
            name: req.body.name,
            licenseNumber: req.body.licenseNumber,
            birdthDate: new Date(req.body.birdthDate),
            address: req.body.address,
            status: req.body.status,
            photoKey: photoKey,
            accountId: accountResult.accountId
        }

        const newDriver = await DriverService.createDriver(driverData);
        newDriver.photoKey = await getSignedUrlForKey(newDriver.photoKey);
        res.status(201).json(newDriver);
    }catch(error){
        console.error("Error creating driver:", error);
        res.status(500).json({ message: "Failed to create the driver" });
    }
    
}

export async function getDriverById(req: Request, res: Response) {
  try {
    const id = parseInt(req.params.id);
    const driver = await DriverService.getDriverById(id);

    if (!driver) {
      return res.status(404).json({ message: "Driver not found" });
    }

    driver.photoKey = await getSignedUrlForKey(driver.photoKey);
    
    res.json(driver);
  } catch (error) {
    console.error("Error getting driver:", error);
    res.status(500).json({ message: "Failed to get driver" });
  }
}

export async function getDriverByAccountId(req: Request, res: Response) {
  try {
    const accountId = req.params.accountId;
    const driver = await DriverService.getDriverByAccountId(accountId);

    if (!driver) {
      return res.status(404).json({ message: "Driver not found for this account" });
    }

    res.json({ id: driver.id, name: driver.name });
  } catch (error) {
    console.error("Error getting driver by accountId:", error);
    res.status(500).json({ message: "Failed to get driver" });
  }
}

export async function getAllDrivers(req: Request, res: Response) {
  try {
    const drivers = await DriverService.getAllDrivers();

    const optimizedDrivers = await Promise.all(
      drivers.map(async (driver) => ({
        id: driver.id,
        name: driver.name,
        licenseNumber: driver.licenseNumber,
        birthDate: driver.birdthDate,
        status: driver.status,
        photoKey: driver.photoKey ? await getSignedUrlForKey(driver.photoKey) : "",
      }))
    );

    res.json(optimizedDrivers);
  } catch (error) {
    console.error("Error getting drivers:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function updateDriver(req: Request, res: Response) {
  try {
    const id = parseInt(req.params.id);
    let photoKey: string | undefined;

    if (req.file) {
      photoKey = await uploadToS3(req.file, "drivers");
    }

    const updateData: Record<string, unknown> = { ...req.body };
    if (photoKey) {
      updateData.photoKey = photoKey;
    }
    if (req.body.birthdate) {
      updateData.birthdate = new Date(req.body.birthdate);
    }

    const driver = await DriverService.updateDriver(id, updateData);
    driver.photoKey = await getSignedUrlForKey(driver.photoKey);
    res.json(driver);
  } catch (error) {
    console.error("Error updating driver:", error);
    res.status(500).json({ message: "Failed to update driver" });
  }
}

export async function deleteDriver(req: Request, res: Response) {
  try {
    const id = parseInt(req.params.id);
    await DriverService.deleteDriver(id);
    res.status(204).send();
  } catch (error) {
    console.error("Error deleting driver:", error);
    res.status(500).json({ message: "Failed to delete driver" });
  }
}