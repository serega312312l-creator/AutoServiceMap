export type PlaceCategory =
  | "all"
  | "sto"
  | "autoshop"
  | "tires"
  | "car_dealer"
  | "car_wash"
  | "fuel"
  | "ev_charging"
  | "diagnostics"
  | "towing"
  | "body_shop"
  | "motorcycle"
  | "truck_service"
  | "parking"
  | "other_auto";

export type PlaceSource = "google" | "osm" | "local";

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface Place {
  id: string;
  name: string;
  category: PlaceCategory;
  subcategory?: string;
  source: PlaceSource;
  coordinates: Coordinates;
  address?: string;
  street?: string;
  city?: string;
  region?: string;
  phone?: string;
  email?: string;
  website?: string;
  openingHours?: string;
  brand?: string;
  operator?: string;
  services?: string[];
  distanceMeters?: number;
  rating?: number;
  isOpen?: boolean;
}

export interface UserLocation extends Coordinates {
  accuracy?: number;
}

export interface StructuredPlaceRecord {
  id: string;
  osm_type: string;
  osm_id: number;
  name: string;
  category_id: Exclude<PlaceCategory, "all">;
  subcategory?: string;
  latitude: number;
  longitude: number;
  street?: string;
  housenumber?: string;
  city?: string;
  district?: string;
  region_id?: string;
  region_name?: string;
  postal_code?: string;
  full_address?: string;
  phone?: string;
  email?: string;
  website?: string;
  opening_hours?: string;
  brand?: string;
  operator?: string;
  wheelchair?: string;
  services?: string[];
  source: PlaceSource;
  updated_at?: string;
}
