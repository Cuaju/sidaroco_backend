type ScheduleTrip = {
  tripId: number;
  routeId: number;
  serviceDate: string;
};

type ScheduleDayTrip = {
  id: number;
  routeId: number;
  busId: number;
  driverId: number;
  departureTime: string;
  status: string;
};

type ScheduleDay = {
  id: number;
  serviceDate: string;
  trips: ScheduleDayTrip[];
};

function toLocalDateString(d: Date): string {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export async function scheduleGetTripsInRange(
  from: Date,
  to: Date,
  authHeader: string
): Promise<ScheduleTrip[]> {
  const baseUrl = process.env.SCHEDULE_SERVICE_URL;
  if (!baseUrl) throw new Error("SCHEDULE_SERVICE_URL is missing");
  
  const fromStr = toLocalDateString(from);
  const toStr = toLocalDateString(to);
  
  const url = `${baseUrl}/schedule/trips/ids?from=${fromStr}&to=${toStr}`;
  
  console.log("Schedule Client - Request:", { 
    url, 
    from: fromStr, 
    to: toStr,
    fromDate: from.toString(),
    toDate: to.toString()
  });
  
  const res = await fetch(url, {
    headers: { Authorization: authHeader },
  });
  
  if (!res.ok) {
    const errorText = await res.text().catch(() => "Unknown error");
    console.error("SCHEDULE_SERVICE_ERROR:", res.status, errorText);
    throw new Error(`scheduleGetTripsInRange failed: ${res.status}`);
  }
  
  const data = await res.json();
  console.log("Schedule Client - Response:", data.length, "trips");
  
  return data as ScheduleTrip[];
}

export async function scheduleGetDaySchedule(
  date: string,
  authHeader?: string
): Promise<ScheduleDay | null> {
  const baseUrl = process.env.SCHEDULE_SERVICE_URL;
  if (!baseUrl) throw new Error("SCHEDULE_SERVICE_URL is missing");

  const url = `${baseUrl}/schedule/${date}`;

  const res = await fetch(url, {
    headers: authHeader ? { Authorization: authHeader } : {},
  });

  if (res.status === 404) {
    return null;
  }

  if (!res.ok) {
    const errorText = await res.text().catch(() => "Unknown error");
    console.error("SCHEDULE_SERVICE_ERROR:", res.status, errorText);
    throw new Error(`scheduleGetDaySchedule failed: ${res.status}`);
  }

  const data = await res.json();
  return data as ScheduleDay;
}