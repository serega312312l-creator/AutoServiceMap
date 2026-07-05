import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const PLACES_PATH = path.join(ROOT, "assets", "data", "places.json");
const EXPORT_REGIONS = path.join(ROOT, "database", "exports", "regions");
const MANIFEST_PATHS = [
  path.join(ROOT, "database", "exports", "places-manifest.json"),
  path.join(ROOT, "assets", "data", "places-manifest.json"),
];

const places = JSON.parse(fs.readFileSync(PLACES_PATH, "utf8"));
const version = places[0]?.updated_at ?? new Date().toISOString();

fs.mkdirSync(EXPORT_REGIONS, { recursive: true });

const byRegion = new Map();
for (const place of places) {
  const id = place.region_id || "unknown";
  if (!byRegion.has(id)) byRegion.set(id, []);
  byRegion.get(id).push(place);
}

const regions = [];
for (const [id, items] of byRegion) {
  fs.writeFileSync(path.join(EXPORT_REGIONS, `${id}.json`), JSON.stringify(items));
  regions.push({
    id,
    name: items[0]?.region_name ?? id,
    count: items.length,
    version,
  });
}

regions.sort((a, b) => a.name.localeCompare(b.name, "uk"));

const manifest = {
  version,
  generated_at: version,
  total: places.length,
  base_url: process.env.DATABASE_BASE_URL ?? "",
  regions,
};

for (const p of MANIFEST_PATHS) {
  fs.writeFileSync(p, JSON.stringify(manifest, null, 2));
}

console.log(`Маніфест: ${regions.length} регіонів, ${places.length} місць`);
console.log(`Регіони: ${EXPORT_REGIONS}`);
