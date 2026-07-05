// Викликається після npm run export:manifest (GitHub Actions / локально)
// node scripts/notify-region-push.mjs kyiv 12

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY;

const REGION_CENTERS = {
  kyiv: { lat: 50.4501, lng: 30.5234, name: "Київ" },
  lviv: { lat: 49.8397, lng: 24.0297, name: "Львів" },
  odesa: { lat: 46.4825, lng: 30.7233, name: "Одеса" },
  kharkiv: { lat: 49.9935, lng: 36.2304, name: "Харків" },
  dnipro: { lat: 48.4647, lng: 35.0462, name: "Дніпро" },
};

async function main() {
  const regionId = process.argv[2] ?? "kyiv";
  const newCount = parseInt(process.argv[3] ?? "1", 10);
  const region = REGION_CENTERS[regionId] ?? REGION_CENTERS.kyiv;

  if (!SUPABASE_URL || !SERVICE_ROLE) {
    console.error("Потрібні SUPABASE_URL та SUPABASE_SERVICE_ROLE_KEY");
    process.exit(1);
  }

  const res = await fetch(`${SUPABASE_URL}/functions/v1/send-push`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${SERVICE_ROLE}`,
    },
    body: JSON.stringify({
      mode: "broadcast",
      title: "AVTOGID — нові СТО",
      body: `+${newCount} місць у регіоні ${region.name}`,
      newPlacesCount: newCount,
      regionName: region.name,
      latitude: region.lat,
      longitude: region.lng,
      radiusKm: 100,
    }),
  });

  const json = await res.json();
  console.log(json);
}

main();
