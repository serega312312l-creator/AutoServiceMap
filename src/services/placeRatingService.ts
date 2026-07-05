import { getJson, setJson } from "@/services/storageUtils";

const RATINGS_KEY = "avtogid:place_ratings";

export type UserRatingValue = "responds" | "no_answer" | "closed" | "helpful";

export interface PlaceUserRating {
  placeId: string;
  value: UserRatingValue;
  timestamp: string;
}

export interface PlaceRatingSummary {
  responds: number;
  noAnswer: number;
  closed: number;
  helpful: number;
  score: number;
}

export async function getAllRatings(): Promise<PlaceUserRating[]> {
  return getJson<PlaceUserRating[]>(RATINGS_KEY, []);
}

export async function ratePlace(placeId: string, value: UserRatingValue): Promise<void> {
  const ratings = await getAllRatings();
  const filtered = ratings.filter((r) => r.placeId !== placeId);
  filtered.push({ placeId, value, timestamp: new Date().toISOString() });
  await setJson(RATINGS_KEY, filtered);
}

export async function getPlaceRatingSummary(placeId: string): Promise<PlaceRatingSummary> {
  const ratings = (await getAllRatings()).filter((r) => r.placeId === placeId);
  const summary = { responds: 0, noAnswer: 0, closed: 0, helpful: 0, score: 0 };

  for (const r of ratings) {
    summary[r.value === "no_answer" ? "noAnswer" : r.value]++;
  }

  const total = ratings.length || 1;
  summary.score = Math.round(
    ((summary.responds + summary.helpful) / total) * 100
  );

  return summary;
}

export const RATING_OPTIONS: { value: UserRatingValue; label: string; emoji: string }[] = [
  { value: "responds", label: "Відповідають", emoji: "✅" },
  { value: "helpful", label: "Допомогли", emoji: "👍" },
  { value: "no_answer", label: "Не беруть", emoji: "📵" },
  { value: "closed", label: "Зачинено", emoji: "🚫" },
];
