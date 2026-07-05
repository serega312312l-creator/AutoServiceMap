import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import initSqlJs from "sql.js";
import {
  UKRAINE_BOUNDS,
  OVERPASS_ENDPOINTS,
  REGION_ALIASES,
  buildRegionQuery,
  classifyPlace,
  extractName,
  extractRegionId,
  buildAddress,
  extractServices,
  getCoordinates,
  sleep,
} from "./osm-utils.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const DB_PATH = path.join(ROOT, "database", "autoservice_ukraine.db");
const SCHEMA_PATH = path.join(ROOT, "database", "schema.sql");
const CATEGORIES_PATH = path.join(ROOT, "database", "categories.json");
const REGIONS_PATH = path.join(ROOT, "database", "regions.json");
const EXPORT_DIR = path.join(ROOT, "database", "exports");
const REGION_CACHE_DIR = path.join(ROOT, "database", "cache", "regions");
const ASSETS_DATA_DIR = path.join(ROOT, "assets", "data");

function ensureDirs() {
  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
  fs.mkdirSync(EXPORT_DIR, { recursive: true });
  fs.mkdirSync(REGION_CACHE_DIR, { recursive: true });
  fs.mkdirSync(ASSETS_DATA_DIR, { recursive: true });
}

async function initDatabase(SQL) {
  const db = new SQL.Database();
  db.run(fs.readFileSync(SCHEMA_PATH, "utf8"));

  const categories = JSON.parse(fs.readFileSync(CATEGORIES_PATH, "utf8"));
  const regions = JSON.parse(fs.readFileSync(REGIONS_PATH, "utf8"));
  const now = new Date().toISOString();

  const insertCategory = `
    INSERT INTO categories (id, name_uk, name_en, emoji, sort_order)
    VALUES (?, ?, ?, ?, ?)
  `;
  const insertRegion = `
    INSERT INTO regions (id, name_uk, name_en)
    VALUES (?, ?, ?)
  `;

  for (const row of categories) {
    db.run(insertCategory, [row.id, row.name_uk, row.name_en, row.emoji, row.sort_order]);
  }

  for (const row of regions) {
    db.run(insertRegion, [row.id, row.name_uk, row.name_en]);
  }

  db.run(`INSERT INTO meta (key, value) VALUES (?, ?)`, ["country", "UA"]);
  db.run(`INSERT INTO meta (key, value) VALUES (?, ?)`, ["source", "openstreetmap"]);
  db.run(`INSERT INTO meta (key, value) VALUES (?, ?)`, ["created_at", now]);

  return db;
}

function upsertPlace(db, place) {
  db.run(
    `
      INSERT INTO places (
        id, osm_type, osm_id, name, category_id, subcategory,
        latitude, longitude, street, housenumber, city, district,
        region_id, region_name, postal_code, full_address,
        phone, email, website, opening_hours, brand, operator,
        wheelchair, services_json, tags_json, source, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(osm_type, osm_id) DO UPDATE SET
        name = excluded.name,
        category_id = excluded.category_id,
        subcategory = excluded.subcategory,
        latitude = excluded.latitude,
        longitude = excluded.longitude,
        street = excluded.street,
        housenumber = excluded.housenumber,
        city = excluded.city,
        district = excluded.district,
        region_id = excluded.region_id,
        region_name = excluded.region_name,
        postal_code = excluded.postal_code,
        full_address = excluded.full_address,
        phone = excluded.phone,
        email = excluded.email,
        website = excluded.website,
        opening_hours = excluded.opening_hours,
        brand = excluded.brand,
        operator = excluded.operator,
        wheelchair = excluded.wheelchair,
        services_json = excluded.services_json,
        tags_json = excluded.tags_json,
        updated_at = excluded.updated_at
    `,
    [
      place.id,
      place.osm_type,
      place.osm_id,
      place.name,
      place.category_id,
      place.subcategory,
      place.latitude,
      place.longitude,
      place.street,
      place.housenumber,
      place.city,
      place.district,
      place.region_id,
      place.region_name,
      place.postal_code,
      place.full_address,
      place.phone,
      place.email,
      place.website,
      place.opening_hours,
      place.brand,
      place.operator,
      place.wheelchair,
      place.services_json,
      place.tags_json,
      place.source,
      place.created_at,
      place.updated_at,
    ]
  );
}

function extractPhone(tags) {
  return (
    tags.phone ||
    tags["contact:phone"] ||
    tags.mobile ||
    tags["contact:mobile"] ||
    tags["phone:mobile"] ||
    null
  );
}

function elementToPlace(element, regionNameById) {
  const tags = element.tags ?? {};
  const name = extractName(tags);
  const coords = getCoordinates(element);

  if (!name || !coords) return null;
  if (
    coords.latitude < UKRAINE_BOUNDS.south ||
    coords.latitude > UKRAINE_BOUNDS.north ||
    coords.longitude < UKRAINE_BOUNDS.west ||
    coords.longitude > UKRAINE_BOUNDS.east
  ) {
    return null;
  }

  const { categoryId, subcategory } = classifyPlace(tags);
  const address = buildAddress(tags);
  const regionId = extractRegionId(tags, REGION_ALIASES);
  const regionName = regionId ? regionNameById.get(regionId) ?? address.regionName : address.regionName;
  const now = new Date().toISOString();

  return {
    id: `osm-${element.type}-${element.id}`,
    osm_type: element.type,
    osm_id: element.id,
    name,
    category_id: categoryId,
    subcategory,
    latitude: coords.latitude,
    longitude: coords.longitude,
    street: address.street,
    housenumber: address.housenumber,
    city: address.city,
    district: address.district,
    region_id: regionId,
    region_name: regionName,
    postal_code: address.postalCode,
    full_address: address.fullAddress,
    phone: extractPhone(tags),
    email: tags.email || tags["contact:email"] || null,
    website: tags.website || tags["contact:website"] || null,
    opening_hours: tags.opening_hours || null,
    brand: tags.brand || null,
    operator: tags.operator || null,
    wheelchair: tags.wheelchair || null,
    services_json: JSON.stringify(extractServices(tags)),
    tags_json: JSON.stringify(tags),
    source: "osm",
    created_at: now,
    updated_at: now,
  };
}

async function fetchOverpass(query, endpointIndex = 0) {
  const endpoint = OVERPASS_ENDPOINTS[endpointIndex % OVERPASS_ENDPOINTS.length];
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
      Accept: "application/json",
      "User-Agent": "AVTOGID/1.0 (Ukraine auto POI database builder)",
    },
    body: `data=${encodeURIComponent(query)}`,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Overpass ${response.status}: ${text.slice(0, 200)}`);
  }

  return response.json();
}

async function fetchRegion(region, attempt = 0) {
  const cacheFile = path.join(REGION_CACHE_DIR, `${region.id}.json`);
  if (fs.existsSync(cacheFile)) {
    return JSON.parse(fs.readFileSync(cacheFile, "utf8"));
  }

  const queries = buildRegionQuery(region.id);
  const mergedElements = new Map();

  for (const query of queries) {
    try {
      const data = await fetchOverpass(query, attempt);
      for (const element of data.elements ?? []) {
        mergedElements.set(`${element.type}-${element.id}`, element);
      }
      await sleep(1200);
    } catch (error) {
      if (attempt < OVERPASS_ENDPOINTS.length * 2) {
        await sleep(4000 * (attempt + 1));
        return fetchRegion(region, attempt + 1);
      }
      throw error;
    }
  }

  const payload = { elements: Array.from(mergedElements.values()) };
  fs.writeFileSync(cacheFile, JSON.stringify(payload));
  return payload;
}

function queryAll(db, sql) {
  const result = db.exec(sql);
  if (!result.length) return [];
  const [{ columns, values }] = result;
  return values.map((row) => Object.fromEntries(columns.map((col, index) => [col, row[index]])));
}

function exportJson(db) {
  const categories = queryAll(db, "SELECT * FROM categories ORDER BY sort_order");
  const statsByCategory = queryAll(
    db,
    "SELECT category_id, COUNT(*) as count FROM places GROUP BY category_id ORDER BY count DESC"
  );
  const statsByRegion = queryAll(
    db,
    "SELECT COALESCE(region_name, 'Невідомо') as region_name, COUNT(*) as count FROM places GROUP BY region_name ORDER BY count DESC"
  );
  const total = queryAll(db, "SELECT COUNT(*) as count FROM places")[0]?.count ?? 0;

  const places = queryAll(
    db,
    `
      SELECT
        id, osm_type, osm_id, name, category_id, subcategory,
        latitude, longitude, street, housenumber, city, district,
        region_id, region_name, postal_code, full_address,
        phone, email, website, opening_hours, brand, operator,
        wheelchair, services_json, source, updated_at
      FROM places
      ORDER BY region_name, city, name
    `
  ).map((place) => ({
    ...place,
    services: JSON.parse(place.services_json || "[]"),
    services_json: undefined,
  }));

  const stats = {
    total,
    generated_at: new Date().toISOString(),
    by_category: statsByCategory,
    by_region: statsByRegion,
  };

  fs.writeFileSync(path.join(EXPORT_DIR, "stats.json"), JSON.stringify(stats, null, 2));
  fs.writeFileSync(path.join(EXPORT_DIR, "categories.json"), JSON.stringify(categories, null, 2));
  fs.writeFileSync(path.join(EXPORT_DIR, "places.json"), JSON.stringify(places));
  fs.writeFileSync(path.join(ASSETS_DATA_DIR, "places.json"), JSON.stringify(places));

  exportRegionalFiles(places, stats.generated_at);

  return stats;
}

function exportRegionalFiles(places, version) {
  const regionsDir = path.join(EXPORT_DIR, "regions");
  fs.mkdirSync(regionsDir, { recursive: true });

  const byRegion = new Map();
  for (const place of places) {
    const id = place.region_id || "unknown";
    if (!byRegion.has(id)) byRegion.set(id, []);
    byRegion.get(id).push(place);
  }

  const regions = [];
  for (const [id, items] of byRegion) {
    fs.writeFileSync(path.join(regionsDir, `${id}.json`), JSON.stringify(items));
    regions.push({
      id,
      name: items[0]?.region_name ?? id,
      count: items.length,
      version,
    });
  }

  regions.sort((a, b) => String(a.name).localeCompare(String(b.name), "uk"));

  const manifest = {
    version,
    generated_at: version,
    total: places.length,
    base_url: process.env.DATABASE_BASE_URL ?? "",
    regions,
  };

  fs.writeFileSync(path.join(EXPORT_DIR, "places-manifest.json"), JSON.stringify(manifest, null, 2));
  fs.writeFileSync(path.join(ASSETS_DATA_DIR, "places-manifest.json"), JSON.stringify(manifest, null, 2));
}

function saveDatabase(db) {
  const binary = db.export();
  fs.writeFileSync(DB_PATH, Buffer.from(binary));
}

async function main() {
  ensureDirs();
  console.log("Ініціалізація бази даних...");

  const SQL = await initSqlJs({
    locateFile: (file) => path.join(ROOT, "node_modules", "sql.js", "dist", file),
  });

  const db = await initDatabase(SQL);
  const regions = JSON.parse(fs.readFileSync(REGIONS_PATH, "utf8"));
  const regionNameById = new Map(regions.map((region) => [region.id, region.name_uk]));

  console.log(`Завантаження ${regions.length} областей України з OpenStreetMap...`);

  let processed = 0;
  let inserted = 0;

  for (const region of regions) {
    processed += 1;
    process.stdout.write(`\r[${processed}/${regions.length}] ${region.name_uk}...`);

    try {
      const data = await fetchRegion(region);

      for (const element of data.elements ?? []) {
        const place = elementToPlace(element, regionNameById);
        if (place) {
          if (!place.region_id) {
            place.region_id = region.id;
            place.region_name = region.name_uk;
          }
          upsertPlace(db, place);
          inserted += 1;
        }
      }
    } catch (error) {
      console.error(`\nПомилка області ${region.name_uk}: ${error.message}`);
    }

    if (processed % 3 === 0) {
      saveDatabase(db);
    }

    await sleep(2000);
  }

  console.log("\nЕкспорт JSON...");
  const stats = exportJson(db);
  db.run(`INSERT INTO meta (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value`, [
    "total_places",
    String(stats.total),
  ]);
  db.run(`INSERT INTO meta (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value`, [
    "updated_at",
    stats.generated_at,
  ]);
  db.run(`INSERT INTO meta (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value`, [
    "regions_processed",
    String(processed),
  ]);

  saveDatabase(db);
  db.close();

  console.log("\nГотово.");
  console.log(`База: ${DB_PATH}`);
  console.log(`JSON: ${path.join(EXPORT_DIR, "places.json")}`);
  console.log(`Записів: ${stats.total}`);
  console.log("Категорії:");
  for (const row of stats.by_category) {
    console.log(`  - ${row.category_id}: ${row.count}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
