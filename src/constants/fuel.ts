import { FuelType } from "@/types/car";

export interface FuelFilterOption {
  id: FuelType | "all";
  label: string;
  emoji: string;
}

export const FUEL_FILTER_OPTIONS: FuelFilterOption[] = [
  { id: "all", label: "Усі АЗС", emoji: "⛽" },
  { id: "petrol", label: "Бензин", emoji: "🟢" },
  { id: "diesel", label: "Дизель", emoji: "🟤" },
  { id: "lpg", label: "Газ", emoji: "🔵" },
  { id: "electric", label: "Електро", emoji: "⚡" },
];

/** Грубий фільтр АЗС за типом палива (за назвою/брендом) */
export function filterFuelPlaces(places: import("@/types/place").Place[], fuel: FuelType | "all") {
  if (fuel === "all") return places;
  const keywords: Record<FuelType, string[]> = {
    petrol: ["okko", "wog", "socar", "аміс", "бензин", "95", "92", "98"],
    diesel: ["дизель", "diesel", "dt", "okko", "wog"],
    lpg: ["газ", "lpg", "пропан", "autogas"],
    electric: ["заряд", "charge", "ev", "електро"],
    hybrid: [],
  };
  const keys = keywords[fuel];
  return places.filter((p) => {
    if (p.category === "ev_charging") return fuel === "electric";
    if (p.category !== "fuel") return fuel !== "electric";
    const text = `${p.name} ${p.brand ?? ""} ${p.operator ?? ""}`.toLowerCase();
    return keys.some((k) => text.includes(k)) || fuel === "petrol";
  });
}
