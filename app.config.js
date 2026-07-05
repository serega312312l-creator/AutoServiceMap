const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY ?? "YOUR_GOOGLE_MAPS_API_KEY";
const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY ?? GOOGLE_MAPS_API_KEY;
const DATABASE_MANIFEST_URL = process.env.DATABASE_MANIFEST_URL ?? "";
const DATABASE_BASE_URL = process.env.DATABASE_BASE_URL ?? "";
const SUPABASE_URL = process.env.SUPABASE_URL ?? "";
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY ?? "";

/** @type {import('expo/config').ExpoConfig} */
module.exports = {
  name: "AVTOGID",
  slug: "avtogid",
  version: "1.0.0",
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
    adaptiveIcon: {
      foregroundImage: "./assets/adaptive-icon.png",
      backgroundColor: "#0f172a",
    },
    package: "com.avtogid.app",
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
