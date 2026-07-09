/** Cursor Cloud Secrets можуть мати локалізовані імена — читаємо обидва варіанти */
function envFirst(...keys) {
  for (const key of keys) {
    const value = process.env[key];
    if (value?.trim()) return value.trim();
  }
  return "";
}

const GOOGLE_MAPS_API_KEY =
  envFirst("GOOGLE_MAPS_API_KEY", "КЛЮЧ_API_КАРТ_GOOGLE") || "YOUR_GOOGLE_MAPS_API_KEY";
const GOOGLE_PLACES_API_KEY =
  envFirst("GOOGLE_PLACES_API_KEY") || GOOGLE_MAPS_API_KEY;
const DATABASE_MANIFEST_URL = envFirst("DATABASE_MANIFEST_URL");
const DATABASE_BASE_URL = envFirst("DATABASE_BASE_URL");
const SUPABASE_URL = envFirst("SUPABASE_URL", "URL-адреса_SUPABASE");
const SUPABASE_ANON_KEY = envFirst("SUPABASE_ANON_KEY");
const fs = require("fs");
const path = require("path");
const hasGoogleServices = fs.existsSync(path.join(__dirname, "google-services.json"));

/** @type {import('expo/config').ExpoConfig} */
module.exports = {
  name: "AVTOGID",
  slug: "avtogid",
  version: "1.0.1",
  orientation: "portrait",
  icon: "./assets/icon.png",
  scheme: "avtogid",
  userInterfaceStyle: "automatic",
  newArchEnabled: true,
  splash: {
    image: "./assets/splash-icon.png",
    resizeMode: "contain",
    backgroundColor: "#0f172a",
  },
  ios: {
    supportsTablet: true,
    bundleIdentifier: "com.avtogid.app",
    infoPlist: {
      NSLocationWhenInUseUsageDescription:
        "AVTOGID потребує доступ до геолокації, щоб показати СТО та автомагазини поруч з вами.",
    },
    config: {
      googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    },
  },
  android: {
    versionCode: 2,
    adaptiveIcon: {
      foregroundImage: "./assets/adaptive-icon.png",
      backgroundColor: "#0f172a",
    },
    package: "com.avtogid.app",
    ...(hasGoogleServices ? { googleServicesFile: "./google-services.json" } : {}),
    permissions: [
      "ACCESS_COARSE_LOCATION",
      "ACCESS_FINE_LOCATION",
      "CAMERA",
      "POST_NOTIFICATIONS",
    ],
    intentFilters: [
      {
        action: "VIEW",
        autoVerify: true,
        data: [{ scheme: "avtogid" }],
        category: ["BROWSABLE", "DEFAULT"],
      },
    ],
    config: {
      googleMaps: {
        apiKey: GOOGLE_MAPS_API_KEY,
      },
    },
  },
  plugins: [
    "expo-router",
    [
      "expo-location",
      {
        locationWhenInUsePermission:
          "Дозвольте AVTOGID використовувати вашу геолокацію для пошуку СТО та автомагазинів поруч.",
      },
    ],
    "expo-asset",
    "expo-font",
    [
      "expo-image-picker",
      {
        cameraPermission: "AVTOGID потребує камеру для фото входу до СТО.",
      },
    ],
    [
      "expo-notifications",
      {
        icon: "./assets/icon.png",
        color: "#2563eb",
      },
    ],
    [
      "react-native-android-widget",
      {
        widgets: [
          {
            name: "AvtogidQuick",
            label: "AVTOGID",
            description: "Найближче СТО, 112 та швидкий доступ",
            minWidth: "250dp",
            minHeight: "110dp",
            targetCellWidth: 4,
            targetCellHeight: 2,
            updatePeriodMillis: 900000,
          },
        ],
      },
    ],
  ],
  extra: {
    googlePlacesApiKey: GOOGLE_PLACES_API_KEY,
    databaseManifestUrl: DATABASE_MANIFEST_URL,
    databaseBaseUrl: DATABASE_BASE_URL,
    supabaseUrl: SUPABASE_URL,
    supabaseAnonKey: SUPABASE_ANON_KEY,
    router: {
      origin: false,
    },
    eas: {
      projectId: process.env.EAS_PROJECT_ID ?? "6c4dfe0e-99da-4a1b-b8bb-76fb103afce3",
    },
  },
};
