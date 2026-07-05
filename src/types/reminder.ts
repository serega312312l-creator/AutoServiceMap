export type ReminderType = "oil" | "tires" | "brakes" | "inspection" | "battery" | "custom";

export interface MaintenanceReminder {
  id: string;
  carId?: string;
  type: ReminderType;
  title: string;
  dueDate?: string;
  dueMileageKm?: number;
  notifyDaysBefore: number;
  completed: boolean;
  createdAt: string;
}

export const REMINDER_TYPE_LABELS: Record<ReminderType, string> = {
  oil: "Заміна масла",
  tires: "Шини / сезонна заміна",
  brakes: "Гальма",
  inspection: "Техогляд",
  battery: "Акумулятор",
  custom: "Своє нагадування",
};
