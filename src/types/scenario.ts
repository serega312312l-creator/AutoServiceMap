import { PlaceCategory } from "@/types/place";

export type ScenarioId =
  | "flat_tire"
  | "dead_battery"
  | "wont_start"
  | "accident"
  | "overheat"
  | "out_of_fuel"
  | "locked_out";

export interface BreakdownScenario {
  id: ScenarioId;
  label: string;
  emoji: string;
  description: string;
  categories: PlaceCategory[];
  tips: string[];
}
