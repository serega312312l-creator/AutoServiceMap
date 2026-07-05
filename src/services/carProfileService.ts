import { CarProfile } from "@/types/car";
import { generateId, getJson, setJson } from "@/services/storageUtils";

const CARS_KEY = "avtogid:cars";
const ACTIVE_CAR_KEY = "avtogid:active_car";

export async function getCars(): Promise<CarProfile[]> {
  return getJson<CarProfile[]>(CARS_KEY, []);
}

export async function getActiveCarId(): Promise<string | null> {
  const { default: AsyncStorage } = await import("@react-native-async-storage/async-storage");
  return AsyncStorage.getItem(ACTIVE_CAR_KEY);
}

export async function getActiveCar(): Promise<CarProfile | null> {
  const cars = await getCars();
  const activeId = await getActiveCarId();
  if (!activeId) return cars[0] ?? null;
  return cars.find((c) => c.id === activeId) ?? cars[0] ?? null;
}

export async function saveCar(car: Omit<CarProfile, "id" | "createdAt"> & { id?: string }): Promise<CarProfile> {
  const cars = await getCars();
  const profile: CarProfile = {
    ...car,
    id: car.id ?? generateId(),
    isElectric: car.fuelType === "electric" || car.fuelType === "hybrid",
    isDiesel: car.fuelType === "diesel",
    createdAt: new Date().toISOString(),
  };

  const idx = cars.findIndex((c) => c.id === profile.id);
  if (idx >= 0) {
    cars[idx] = { ...cars[idx], ...profile };
  } else {
    cars.push(profile);
  }

  await setJson(CARS_KEY, cars);
  if (cars.length === 1) await setActiveCar(profile.id);
  return profile;
}

export async function deleteCar(id: string): Promise<void> {
  const cars = (await getCars()).filter((c) => c.id !== id);
  await setJson(CARS_KEY, cars);
  const activeId = await getActiveCarId();
  if (activeId === id) {
    const { default: AsyncStorage } = await import("@react-native-async-storage/async-storage");
    await AsyncStorage.setItem(ACTIVE_CAR_KEY, cars[0]?.id ?? "");
  }
}

export async function setActiveCar(id: string): Promise<void> {
  const { default: AsyncStorage } = await import("@react-native-async-storage/async-storage");
  await AsyncStorage.setItem(ACTIVE_CAR_KEY, id);
}

export async function updateCarMileage(id: string, mileageKm: number): Promise<void> {
  const cars = await getCars();
  const car = cars.find((c) => c.id === id);
  if (car) {
    car.mileageKm = mileageKm;
    await setJson(CARS_KEY, cars);
  }
}
