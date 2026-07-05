import { useCallback, useEffect, useState } from "react";
import { MaintenanceReminder } from "@/types/reminder";
import {
  getReminders,
  addReminder,
  toggleReminderComplete,
  deleteReminder,
  getDueReminders,
} from "@/services/reminderService";
import { useCarProfiles } from "@/hooks/useCarProfiles";

export function useReminders() {
  const [reminders, setReminders] = useState<MaintenanceReminder[]>([]);
  const [due, setDue] = useState<MaintenanceReminder[]>([]);
  const { activeCar } = useCarProfiles();

  const refresh = useCallback(async () => {
    const all = await getReminders();
    setReminders(all);
    setDue(getDueReminders(all, activeCar?.mileageKm));
  }, [activeCar?.mileageKm]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return {
    reminders,
    due,
    refresh,
    add: async (data: Parameters<typeof addReminder>[0]) => {
      await addReminder(data);
      await refresh();
    },
    toggle: async (id: string) => {
      await toggleReminderComplete(id);
      await refresh();
    },
    remove: async (id: string) => {
      await deleteReminder(id);
      await refresh();
    },
  };
}
