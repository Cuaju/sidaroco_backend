import "dotenv/config";
import prisma from "./db/prisma";

type LocationSeed = {
  key: string;
  query: string;
};

const MAPBOX_TOKEN = process.env.MAPBOX_TOKEN;

if (!MAPBOX_TOKEN) {
  throw new Error("MAPBOX_TOKEN is missing");
}

const locations: LocationSeed[] = [
  { key: "veracruz", query: "Veracruz, Veracruz, México" },
  { key: "xalapa", query: "Xalapa-Enríquez, Veracruz, México" },
  { key: "tierraBlanca", query: "Tierra Blanca, Veracruz, México" },
  { key: "cordoba", query: "Córdoba, Veracruz, México" },
  { key: "orizaba", query: "Orizaba, Veracruz, México" },
  { key: "tuxpan", query: "Tuxpan de Rodríguez Cano, Veracruz, México" },
  { key: "pozaRica", query: "Poza Rica de Hidalgo, Veracruz, México" },
  { key: "martinez", query: "Martínez de la Torre, Veracruz, México" },
  { key: "coatzacoalcos", query: "Coatzacoalcos, Veracruz, México" },
  { key: "minatitlan", query: "Minatitlán, Veracruz, México" },
  { key: "sanAndres", query: "San Andrés Tuxtla, Veracruz, México" },
  { key: "coatepec", query: "Coatepec, Veracruz, México" },
  { key: "papantla", query: "Papantla de Olarte, Veracruz, México" },
  { key: "acayucan", query: "Acayucan, Veracruz, México" },
  { key: "lasChoapas", query: "Las Choapas, Veracruz, México" },
];

async function geocode(place: string) {
  const res = await fetch(
    `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
      place
    )}.json?access_token=${MAPBOX_TOKEN}&country=MX&limit=5`
  );

  const data = await res.json();

  if (!data.features?.length) {
    throw new Error(`Mapbox: no results for "${place}"`);
  }

  const feature =
    data.features.find((f: any) => f.place_type.includes("place")) ||
    data.features.find((f: any) => f.place_type.includes("locality")) ||
    data.features.find((f: any) => f.place_type.includes("region")) ||
    data.features[0];

  const [lng, lat] = feature.center;

  return {
    mapboxId: feature.id,
    name: feature.text,
    fullName: feature.place_name,
    lat,
    lng,
  };
}


function generateTicketPrice() {
  const base = 80;
  const variation = Math.floor(Math.random() * 220); 
  return base + variation;
}

async function main() {
  await prisma.route.deleteMany();
  await prisma.location.deleteMany();

  const locMap: Record<string, number> = {};

  for (const loc of locations) {
    const geo = await geocode(loc.query);

    const created = await prisma.location.create({
      data: {
        mapboxId: geo.mapboxId,
        name: geo.name,
        fullName: geo.fullName,
        lat: geo.lat,
        lng: geo.lng,
      },
    });

    locMap[loc.key] = created.id;
  }

  const hubs = ["xalapa", "veracruz"];
  const allCities = locations.map(l => l.key);
  const routes: Array<{ from: string; to: string }> = [];

  for (const hub of hubs) {
    for (const city of allCities) {
      if (hub !== city) {
        routes.push({ from: hub, to: city });
        routes.push({ from: city, to: hub });
      }
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
    routes.push({ from: a, to: b }, { from: b, to: a });
  }

  for (const r of routes) {
    await prisma.route.upsert({
      where: {
        route_origin_destination_unique: {
          originId: locMap[r.from],
          destinationId: locMap[r.to],
        },
      },
      update: {},
      create: {
        name: `${r.from} → ${r.to}`,
        originId: locMap[r.from],
        destinationId: locMap[r.to],
        ticketPrice: generateTicketPrice(),
      },
    });
  }

  console.log("Route seed done ");
}

main()
  .catch(console.error)
  .finally(async () => prisma.$disconnect());
