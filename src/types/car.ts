export type FuelType = "petrol" | "diesel" | "lpg" | "electric" | "hybrid";
export type TransmissionType = "manual" | "automatic" | "cvt";

export interface CarProfile {
  id: string;
  name: string;
  brand?: string;
  model?: string;
  year?: number;
  fuelType: FuelType;
  transmission: TransmissionType;
  isElectric: boolean;
  isDiesel: boolean;
  mileageKm?: number;
  createdAt: string;
}

export const FUEL_LABELS: Record<FuelType, string> = {
  petrol: "Бензин",
  diesel: "Дизель",
  lpg: "Газ",
  electric: "Електро",
  hybrid: "Гібрид",
};

export const TRANSMISSION_LABELS: Record<TransmissionType, string> = {
  manual: "Механіка",
  automatic: "Автомат",
  cvt: "Варіатор",
};
