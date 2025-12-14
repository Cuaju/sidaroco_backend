export interface BusDTO {
  id: number;
  name: string;
  model: string;
  vin: string;
  plateNumber: string;
  capacity: number;
  status: "active" | "inactive" | "maintenance";
  photoUrl?: string;
  createdAt: string;
  updatedAt: string;

  routeID: number;
}
