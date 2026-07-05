import { PlaceCategory } from "@/types/place";

export interface CategoryFilter {
  id: PlaceCategory;
  label: string;
  emoji: string;
}

export const CATEGORY_FILTERS: CategoryFilter[] = [
  { id: "all", label: "Усі", emoji: "📍" },
  { id: "sto", label: "СТО", emoji: "🔧" },
  { id: "autoshop", label: "Автомагазин", emoji: "🛒" },
  { id: "tires", label: "Шини", emoji: "🛞" },
  { id: "car_dealer", label: "Автосалон", emoji: "🚗" },
  { id: "car_wash", label: "Автомийка", emoji: "🫧" },
  { id: "fuel", label: "АЗС", emoji: "⛽" },
  { id: "ev_charging", label: "Зарядка EV", emoji: "⚡" },
  { id: "diagnostics", label: "Діагностика", emoji: "🖥️" },
  { id: "body_shop", label: "Кузовний", emoji: "🎨" },
  { id: "motorcycle", label: "Мото", emoji: "🏍️" },
  { id: "truck_service", label: "Вантажівки", emoji: "🚚" },
  { id: "other_auto", label: "Інше", emoji: "🔩" },
];

export const SEARCH_RADIUS_METERS = 5000;
export const LOCATION_UPDATE_THRESHOLD_METERS = 150;
