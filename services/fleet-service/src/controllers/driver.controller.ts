import  {Request, Response} from "express";
import { uploadToS3 } from "../utils/s3";
import * as DriverService from "../services/driver.service";

export async function createDriver(req:Request, res:Response) {

    try{
        let photoUrl: string = "";

        if (req.file) {
            photoUrl = await uploadToS3(req.file, "drivers");
        }


        const driverData = {
            name: req.body.name,
            licenseNumber: req.body.licenseNumber,
            birdthDate: new Date(req.body.birdthDate),
            address: req.body.address,
            status: req.body.status,
            photoUrl: photoUrl
        }

        const newDriver = await DriverService.createDriver(driverData);
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

    res.json(driver);
  } catch (error) {
    console.error("Error getting driver:", error);
    res.status(500).json({ message: "Failed to get driver" });
  }
}

export async function getAllDrivers(req:Request, res:Response) {

    try{
        const drivers = await DriverService.getAllDrivers();
        res.json(drivers);
    }catch(error){
        console.error("Error getting drivers:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

export async function updateDriver(req: Request, res: Response) {
  try {
    const id = parseInt(req.params.id);
    let photoUrl: string | undefined;

    if (req.file) {
      photoUrl = await uploadToS3(req.file, "drivers");
    }

    const updateData: Record<string, unknown> = { ...req.body };
    if (photoUrl) {
      updateData.photoUrl = photoUrl;
    }
    if (req.body.birthdate) {
      updateData.birthdate = new Date(req.body.birthdate);
    }

    const driver = await DriverService.updateDriver(id, updateData);
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