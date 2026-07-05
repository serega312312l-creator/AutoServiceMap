export interface EmergencyContact {
  id: string;
  label: string;
  number: string;
  emoji: string;
}

/** Екстрені служби України */
export const EMERGENCY_CONTACTS: EmergencyContact[] = [
  { id: "112", label: "Єдиний", number: "112", emoji: "🆘" },
  { id: "102", label: "Поліція", number: "102", emoji: "🚔" },
  { id: "103", label: "Швидка", number: "103", emoji: "🚑" },
  { id: "104", label: "ДСНС", number: "104", emoji: "🚒" },
];

/** Пріоритет категорій для «найближчий сервіс» при поломці */
export const SERVICE_PRIORITY_CATEGORIES = [
  "towing",
  "sto",
  "tires",
  "autoshop",
  "diagnostics",
  "fuel",
] as const;
