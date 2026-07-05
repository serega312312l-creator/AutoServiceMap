import { Place, PlaceCategory } from "@/types/place";
import { CarProfile } from "@/types/car";

/** Фільтрує місця під профіль авто (Premium) */
export function filterPlacesForCar(places: Place[], car: CarProfile | null): Place[] {
  if (!car) return places;

  return places.filter((place) => {
    if (car.isElectric && place.category === "fuel") return false;
    if (!car.isElectric && place.category === "ev_charging") return false;
    if (car.fuelType === "diesel" && place.category === "ev_charging") return false;
    return true;
  });
}

export function getPreferredCategoriesForCar(car: CarProfile | null): PlaceCategory[] {
  if (!car) return ["sto", "towing", "tires"];
  if (car.isElectric) return ["ev_charging", "sto", "diagnostics", "towing"];
  if (car.fuelType === "diesel") return ["sto", "fuel", "towing", "autoshop"];
  return ["sto", "towing", "tires", "fuel", "autoshop"];
}
