/** Темний стиль Google Maps для нічної їзди */
export const DARK_MAP_STYLE = [
  { elementType: "geometry", stylers: [{ color: "#1d2c4d" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#8ec3b9" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#1a3646" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#304a7d" }] },
  { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#212a37" }] },
  { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#2c6675" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#0e1626" }] },
  { featureType: "poi", elementType: "geometry", stylers: [{ color: "#283d6a" }] },
  { featureType: "transit", stylers: [{ visibility: "off" }] },
];
