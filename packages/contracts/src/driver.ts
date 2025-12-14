export interface DriverDTO{
    id: number;
    name: string;
    licenseNumber: string;
    birdthDate: string;
    address: string;
    status: "available" | "unavailable";
    photoUrl?: string;
    createdAt: string;
    updatedAt: string;
}