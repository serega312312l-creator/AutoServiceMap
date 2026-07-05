export const UKRAINE_BOUNDS = {
  south: 44.38,
  west: 22.14,
  north: 52.38,
  east: 40.23,
};

export const OVERPASS_ENDPOINTS = [
  "https://overpass.kumi.systems/api/interpreter",
  "https://maps.mail.ru/osm/tools/overpass/api/interpreter",
  "https://overpass-api.de/api/interpreter",
];

export const REGION_ALIASES = {
  "vinnytsia oblast": "UA-05",
  "vinnytska oblast": "UA-05",
  "вінницька область": "UA-05",
  "volyn oblast": "UA-07",
  "volyn": "UA-07",
  "волинська область": "UA-07",
  "luhansk oblast": "UA-09",
  "luhansk": "UA-09",
  "луганська область": "UA-09",
  "dnipropetrovsk oblast": "UA-12",
  "dnipropetrovska oblast": "UA-12",
  "дніпропетровська область": "UA-12",
  "donetsk oblast": "UA-14",
  "donetsk": "UA-14",
  "донецька область": "UA-14",
  "zhytomyr oblast": "UA-18",
  "zhytomyrska oblast": "UA-18",
  "житомирська область": "UA-18",
  "zakarpattia oblast": "UA-21",
  "zakarpatska oblast": "UA-21",
  "закарпатська область": "UA-21",
  "zaporizhzhia oblast": "UA-23",
  "zaporizka oblast": "UA-23",
  "запорізька область": "UA-23",
  "ivano-frankivsk oblast": "UA-26",
  "ivano-frankivska oblast": "UA-26",
  "івано-франківська область": "UA-26",
  "kyiv city": "UA-30",
  "kyiv": "UA-30",
  "м. київ": "UA-30",
  "місто київ": "UA-30",
  "kyiv oblast": "UA-32",
  "kyivska oblast": "UA-32",
  "київська область": "UA-32",
  "kirovohrad oblast": "UA-35",
  "kirovohradska oblast": "UA-35",
  "кіровоградська область": "UA-35",
  "sevastopol": "UA-40",
  "севастополь": "UA-40",
  "crimea": "UA-43",
  "autonomous republic of crimea": "UA-43",
  "автономна республіка крим": "UA-43",
  "lviv oblast": "UA-46",
  "lvivska oblast": "UA-46",
  "львівська область": "UA-46",
  "mykolaiv oblast": "UA-48",
  "mykolaivska oblast": "UA-48",
  "миколаївська область": "UA-48",
  "odesa oblast": "UA-51",
  "odeska oblast": "UA-51",
  "одеська область": "UA-51",
  "poltava oblast": "UA-53",
  "poltavska oblast": "UA-53",
  "полтавська область": "UA-53",
  "rivne oblast": "UA-56",
  "rivnenska oblast": "UA-56",
  "рівненська область": "UA-56",
  "sumy oblast": "UA-59",
  "sumska oblast": "UA-59",
  "сумська область": "UA-59",
  "ternopil oblast": "UA-61",
  "ternopilska oblast": "UA-61",
  "тернопільська область": "UA-61",
  "kharkiv oblast": "UA-63",
  "kharkivska oblast": "UA-63",
  "харківська область": "UA-63",
  "kherson oblast": "UA-65",
  "khersonska oblast": "UA-65",
  "херсонська область": "UA-65",
  "khmelnytskyi oblast": "UA-68",
  "khmelnytska oblast": "UA-68",
  "хмельницька область": "UA-68",
  "cherkasy oblast": "UA-71",
  "cherkaska oblast": "UA-71",
  "черкаська область": "UA-71",
  "chernihiv oblast": "UA-74",
  "chernihivska oblast": "UA-74",
  "чернігівська область": "UA-74",
  "chernivtsi oblast": "UA-77",
  "chernivetska oblast": "UA-77",
  "чернівецька область": "UA-77",
};

export function buildRegionQuery(regionId) {
  const groups = [
    `node(area.searchArea)[shop~"^(car_repair|car_parts|tyres|car|caravan|motorcycle|truck|gas)$"];way(area.searchArea)[shop~"^(car_repair|car_parts|tyres|car|caravan|motorcycle|truck|gas)$"];`,
    `node(area.searchArea)[amenity~"^(car_repair|car_wash|fuel|charging_station|vehicle_inspection)$"];way(area.searchArea)[amenity~"^(car_repair|car_wash|fuel|charging_station|vehicle_inspection)$"];`,
    `node(area.searchArea)[craft="car_repair"];way(area.searchArea)[craft="car_repair"];node(area.searchArea)["service:vehicle:car_repair"="yes"];way(area.searchArea)["service:vehicle:car_repair"="yes"];node(area.searchArea)["service:vehicle:tyres"="yes"];way(area.searchArea)["service:vehicle:tyres"="yes"];node(area.searchArea)["service:vehicle:parts"="yes"];way(area.searchArea)["service:vehicle:parts"="yes"];node(area.searchArea)["service:vehicle:car_wash"="yes"];way(area.searchArea)["service:vehicle:car_wash"="yes"];node(area.searchArea)["service:vehicle:body_repair"="yes"];way(area.searchArea)["service:vehicle:body_repair"="yes"];node(area.searchArea)["service:vehicle:diagnostics"="yes"];way(area.searchArea)["service:vehicle:diagnostics"="yes"];`,
  ];

  return groups.map(
    (group) => `
      [out:json][timeout:240];
      area["ISO3166-2"="${regionId}"]->.searchArea;
      (
        ${group}
      );
      out center tags;
    `
  );
}

export function buildTileQuery(south, west, north, east) {
  const bbox = `${south},${west},${north},${east}`;
  const groups = [
    `node["shop"~"^(car_repair|car_parts|tyres|car|caravan|motorcycle|truck|gas)$"](${bbox});way["shop"~"^(car_repair|car_parts|tyres|car|caravan|motorcycle|truck|gas)$"](${bbox});`,
    `node["amenity"~"^(car_repair|car_wash|fuel|charging_station|vehicle_inspection)$"](${bbox});way["amenity"~"^(car_repair|car_wash|fuel|charging_station|vehicle_inspection)$"](${bbox});`,
    `node["craft"="car_repair"](${bbox});way["craft"="car_repair"](${bbox});`,
    `node["service:vehicle:car_repair"="yes"](${bbox});way["service:vehicle:car_repair"="yes"](${bbox});node["service:vehicle:tyres"="yes"](${bbox});way["service:vehicle:tyres"="yes"](${bbox});node["service:vehicle:parts"="yes"](${bbox});way["service:vehicle:parts"="yes"](${bbox});`,
    `node["service:vehicle:car_wash"="yes"](${bbox});way["service:vehicle:car_wash"="yes"](${bbox});node["service:vehicle:body_repair"="yes"](${bbox});way["service:vehicle:body_repair"="yes"](${bbox});node["service:vehicle:diagnostics"="yes"](${bbox});way["service:vehicle:diagnostics"="yes"](${bbox});`,
  ];

  return groups.map(
    (group) => `
      [out:json][timeout:120];
      (
        ${group}
      );
      out center tags;
    `
  );
}

export function generateTiles(bounds, latStep = 1.0, lonStep = 1.5) {
  const tiles = [];
  for (let lat = bounds.south; lat < bounds.north; lat += latStep) {
    for (let lon = bounds.west; lon < bounds.east; lon += lonStep) {
      tiles.push({
        id: `${lat.toFixed(2)}_${lon.toFixed(2)}`,
        south: lat,
        west: lon,
        north: Math.min(lat + latStep, bounds.north),
        east: Math.min(lon + lonStep, bounds.east),
      });
    }
  }
  return tiles;
}

export function classifyPlace(tags) {
  const shop = tags.shop;
  const amenity = tags.amenity;
  const craft = tags.craft;

  if (amenity === "fuel" || shop === "gas") {
    return { categoryId: "fuel", subcategory: shop === "gas" ? "lpg" : "fuel" };
  }
  if (amenity === "charging_station") {
    return { categoryId: "ev_charging", subcategory: tags["socket:type2"] ? "type2" : "ev" };
  }
  if (shop === "tyres" || tags["service:vehicle:tyres"] === "yes") {
    return { categoryId: "tires", subcategory: "tyres" };
  }
  if (shop === "car_parts" || tags["service:vehicle:parts"] === "yes") {
    return { categoryId: "autoshop", subcategory: "parts" };
  }
  if (shop === "car" || shop === "caravan") {
    return { categoryId: "car_dealer", subcategory: shop };
  }
  if (amenity === "car_wash" || tags["service:vehicle:car_wash"] === "yes") {
    return { categoryId: "car_wash", subcategory: "wash" };
  }
  if (amenity === "vehicle_inspection" || tags["service:vehicle:diagnostics"] === "yes") {
    return { categoryId: "diagnostics", subcategory: "inspection" };
  }
  if (shop === "motorcycle") {
    return { categoryId: "motorcycle", subcategory: "motorcycle" };
  }
  if (shop === "truck") {
    return { categoryId: "truck_service", subcategory: "truck" };
  }
  if (tags["service:vehicle:body_repair"] === "yes") {
    return { categoryId: "body_shop", subcategory: "body" };
  }
  if (
    shop === "car_repair" ||
    amenity === "car_repair" ||
    craft === "car_repair" ||
    tags["service:vehicle:car_repair"] === "yes" ||
    tags["service:vehicle:brakes"] === "yes" ||
    tags["service:vehicle:oil_change"] === "yes"
  ) {
    if (tags["service:vehicle:body_repair"] === "yes") {
      return { categoryId: "body_shop", subcategory: "body" };
    }
    if (tags["service:vehicle:oil_change"] === "yes") {
      return { categoryId: "sto", subcategory: "oil_change" };
    }
    return { categoryId: "sto", subcategory: craft || shop || amenity || "repair" };
  }
  if (amenity === "parking") {
    return { categoryId: "parking", subcategory: tags.parking || "parking" };
  }
  if (tags.emergency === "yes" && tags.highway === "emergency_bay") {
    return { categoryId: "towing", subcategory: "emergency" };
  }

  return { categoryId: "other_auto", subcategory: shop || amenity || craft || "unknown" };
}

export function extractName(tags) {
  return (
    tags.name ||
    tags["name:uk"] ||
    tags["name:ru"] ||
    tags["name:en"] ||
    tags.brand ||
    tags.operator ||
    null
  );
}

export function extractRegionId(tags, regionAliases) {
  const candidates = [
    tags["addr:region"],
    tags["addr:province"],
    tags["is_in:state"],
    tags["is_in:region"],
    tags.state,
  ]
    .filter(Boolean)
    .map((value) => value.toLowerCase().trim());

  for (const candidate of candidates) {
    if (regionAliases[candidate]) {
      return regionAliases[candidate];
    }
  }

  for (const [alias, id] of Object.entries(regionAliases)) {
    for (const candidate of candidates) {
      if (candidate.includes(alias) || alias.includes(candidate)) {
        return id;
      }
    }
  }

  return null;
}

export function buildAddress(tags) {
  const street = tags["addr:street"] || tags["addr:place"] || null;
  const housenumber = tags["addr:housenumber"] || null;
  const city = tags["addr:city"] || tags["addr:town"] || tags["addr:village"] || tags["addr:hamlet"] || null;
  const district = tags["addr:district"] || tags["addr:suburb"] || null;
  const regionName = tags["addr:region"] || tags["is_in:state"] || null;
  const postalCode = tags["addr:postcode"] || null;

  const streetLine =
    street && housenumber ? `${street}, ${housenumber}` : street || housenumber;
  const parts = [streetLine, city, district, regionName, postalCode].filter(Boolean);
  return {
    street,
    housenumber,
    city,
    district,
    regionName,
    postalCode,
    fullAddress: parts.join(", ") || null,
  };
}

export function extractServices(tags) {
  const services = [];
  for (const [key, value] of Object.entries(tags)) {
    if (key.startsWith("service:vehicle:") && value === "yes") {
      services.push(key.replace("service:vehicle:", ""));
    }
  }
  if (tags.self_service === "yes") services.push("self_service");
  if (tags.full_service === "yes") services.push("full_service");
  return services;
}

export function getCoordinates(element) {
  if (element.lat != null && element.lon != null) {
    return { latitude: element.lat, longitude: element.lon };
  }
  if (element.center) {
    return { latitude: element.center.lat, longitude: element.center.lon };
  }
  return null;
}

export function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
