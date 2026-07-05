import { PlaceCategory } from "@/types/place";

export interface CategoryFilter {
  id: PlaceCategory;
  label: string;
  emoji: string;
}

/** Компактна панель — головні категорії для екстреної допомоги */
export const PRIMARY_CATEGORY_FILTERS: CategoryFilter[] = [
  { id: "all", label: "Усі", emoji: "📍" },
  { id: "sto", label: "СТО", emoji: "🔧" },
  { id: "towing", label: "Евакуатор", emoji: "🛻" },
  { id: "tires", label: "Шини", emoji: "🛞" },
  { id: "autoshop", label: "Запчастини", emoji: "🛒" },
  { id: "fuel", label: "АЗС", emoji: "⛽" },
];

/** Додаткові категорії — розгортаються по кнопці «Ще» */
export const EXTRA_CATEGORY_FILTERS: CategoryFilter[] = [
  { id: "car_dealer", label: "Автосалон", emoji: "🚗" },
  { id: "car_wash", label: "Мийка", emoji: "🫧" },
  { id: "ev_charging", label: "Зарядка", emoji: "⚡" },
  { id: "diagnostics", label: "Діагностика", emoji: "🖥️" },
  { id: "body_shop", label: "Кузовний", emoji: "🎨" },
  { id: "motorcycle", label: "Мото", emoji: "🏍️" },
  { id: "truck_service", label: "Вантажівки", emoji: "🚚" },
  { id: "other_auto", label: "Інше", emoji: "🔩" },
];

export const CATEGORY_FILTERS: CategoryFilter[] = [
  ...PRIMARY_CATEGORY_FILTERS,
  ...EXTRA_CATEGORY_FILTERS,
];

export interface DistanceOption {
  meters: number;
  label: string;
}

export const DISTANCE_OPTIONS: DistanceOption[] = [
  { meters: 5_000, label: "5 км" },
  { meters: 10_000, label: "10 км" },
  { meters: 25_000, label: "25 км" },
  { meters: 50_000, label: "50 км" },
];

export const DEFAULT_RADIUS_METERS = 10_000;
export const MAX_AUTO_EXPAND_RADIUS_METERS = 100_000;
export const SEARCH_RADIUS_METERS = DEFAULT_RADIUS_METERS;
export const LOCATION_UPDATE_THRESHOLD_METERS = 150;
