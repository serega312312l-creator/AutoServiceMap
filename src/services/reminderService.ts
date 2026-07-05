import { MaintenanceReminder, ReminderType } from "@/types/reminder";
import { generateId, getJson, setJson } from "@/services/storageUtils";

const REMINDERS_KEY = "avtogid:reminders";

export async function getReminders(): Promise<MaintenanceReminder[]> {
  return getJson<MaintenanceReminder[]>(REMINDERS_KEY, []);
}

export async function addReminder(
  data: Omit<MaintenanceReminder, "id" | "createdAt" | "completed">
): Promise<MaintenanceReminder> {
  const reminders = await getReminders();
  const reminder: MaintenanceReminder = {
    ...data,
    id: generateId(),
    completed: false,
    createdAt: new Date().toISOString(),
  };
  reminders.push(reminder);
  await setJson(REMINDERS_KEY, reminders);
  return reminder;
}

export async function toggleReminderComplete(id: string): Promise<void> {
  const reminders = await getReminders();
  const r = reminders.find((x) => x.id === id);
  if (r) r.completed = !r.completed;
  await setJson(REMINDERS_KEY, reminders);
}

export async function deleteReminder(id: string): Promise<void> {
  await setJson(
    REMINDERS_KEY,
    (await getReminders()).filter((r) => r.id !== id)
  );
}

export function getDueReminders(
  reminders: MaintenanceReminder[],
  currentMileageKm?: number
): MaintenanceReminder[] {
  const now = new Date();
  return reminders.filter((r) => {
    if (r.completed) return false;
    if (r.dueDate) {
      const due = new Date(r.dueDate);
      const notifyFrom = new Date(due);
      notifyFrom.setDate(notifyFrom.getDate() - r.notifyDaysBefore);
      if (now >= notifyFrom) return true;
    }
    if (r.dueMileageKm != null && currentMileageKm != null) {
      if (currentMileageKm >= r.dueMileageKm - 500) return true;
    }
    return false;
  });
}

export function createDefaultReminders(carId: string): Omit<MaintenanceReminder, "id" | "createdAt" | "completed">[] {
  const in3months = new Date();
  in3months.setMonth(in3months.getMonth() + 3);
  const in6months = new Date();
  in6months.setMonth(in6months.getMonth() + 6);

  return [
    {
      carId,
      type: "oil" as ReminderType,
      title: "Заміна масла",
      dueDate: in3months.toISOString().slice(0, 10),
      dueMileageKm: undefined,
      notifyDaysBefore: 7,
    },
    {
      carId,
      type: "inspection" as ReminderType,
      title: "Техогляд",
      dueDate: in6months.toISOString().slice(0, 10),
      notifyDaysBefore: 14,
    },
  ];
}
