const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY ?? "YOUR_GOOGLE_MAPS_API_KEY";
const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY ?? GOOGLE_MAPS_API_KEY;

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
    permissions: ["ACCESS_COARSE_LOCATION", "ACCESS_FINE_LOCATION"],
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
  ],
  extra: {
    googlePlacesApiKey: GOOGLE_PLACES_API_KEY,
    router: {
      origin: false,
    },
    eas: {
      projectId: process.env.EAS_PROJECT_ID ?? "6c4dfe0e-99da-4a1b-b8bb-76fb103afce3",
    },
  },
};
