import "dotenv/config";
import prisma from "./db/prisma";

type LocationSeed = {
  key: string;
  name: string;
  lat: number;
  lng: number;
};

const locations: LocationSeed[] = [
  { key: "veracruz", name: "Veracruz", lat: 19.178645453727185, lng: -96.13434836498998 },
  { key: "xalapa", name: "Xalapa", lat: 19.528187575718505, lng: -96.90313727180362 },
  { key: "tierraBlanca", name: "Tierra Blanca", lat: 18.448913564073795, lng: -96.35839812627782 },
  { key: "cordoba", name: "Córdoba", lat: 18.882455850916106, lng: -96.91948164103675 },
  { key: "orizaba", name: "Orizaba", lat: 18.847513184664667, lng: -97.0994872034354 },
  { key: "tuxpan", name: "Tuxpan", lat: 20.951100954403167, lng: -97.40232885437464 },
  { key: "pozaRica", name: "Poza Rica", lat: 20.542209782054194, lng: -97.46789878560847 },
  { key: "martinez", name: "Martínez de la Torre", lat: 20.064361129093943, lng: -97.0523908576863 },
  { key: "coatzacoalcos", name: "Coatzacoalcos", lat: 18.12086186076124, lng: -94.44511376876935 },
  { key: "minatitlan", name: "Minatitlán", lat: 17.98282132879945, lng: -94.54411313803439 },
  { key: "sanAndres", name: "San Andrés Tuxtla", lat: 18.45162710057249, lng: -95.218565910028 },
  { key: "coatepec", name: "Coatepec", lat: 19.44855411336902, lng: -96.95313953583194 },
  { key: "papantla", name: "Papantla", lat: 20.451320280871737, lng: -97.31990293848338 },
  { key: "acayucan", name: "Acayucan", lat: 17.94805066054034, lng: -94.90464619280439 },
  { key: "lasChoapas", name: "Las Choapas", lat: 17.914593725609983, lng: -94.09264032574713 },
];

async function main() {
  const locMap: Record<string, string> = {};

  for (const loc of locations) {
    const created = await prisma.location.upsert({
      where: {
        location_name_lat_lng_unique: {
          name: loc.name,
          lat: loc.lat,
          lng: loc.lng,
        },
      },
      update: {},
      create: {
        name: loc.name,
        lat: loc.lat,
        lng: loc.lng,
      },
    });

    locMap[loc.key] = created.id;
  }

  const routes: Array<{ from: string; to: string }> = [];
  const hubs = ["xalapa", "veracruz"];
  const allCities = locations.map(l => l.key);

  for (const hub of hubs) {
    for (const city of allCities) {
      if (hub !== city) routes.push({ from: hub, to: city });
    }
  }

  for (const city of allCities) {
    for (const hub of hubs) {
      if (city !== hub) routes.push({ from: city, to: hub });
    }
  }

  const bidirectional: Array<[string, string]> = [
    ["tuxpan", "pozaRica"],
    ["tuxpan", "papantla"],
    ["tuxpan", "martinez"],
    ["cordoba", "orizaba"],
    ["xalapa", "coatepec"],
    ["coatzacoalcos", "minatitlan"],
    ["minatitlan", "acayucan"],
    ["acayucan", "sanAndres"],
  ];

  for (const [a, b] of bidirectional) {
    routes.push({ from: a, to: b });
    routes.push({ from: b, to: a });
  }

  const seen = new Set<string>();

  for (const r of routes) {
    const key = `${r.from}-${r.to}`;
    if (seen.has(key)) continue;
    seen.add(key);

    await prisma.route.create({
      data: {
        name: `${locations.find(l => l.key === r.from)!.name} → ${locations.find(l => l.key === r.to)!.name}`,
        originId: locMap[r.from],
        destinationId: locMap[r.to],
      },
    });
  }

  console.log("✅ Route seed done.");
}

main()
  .catch(e => {
    console.error("❌ Route seed failed:", e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
