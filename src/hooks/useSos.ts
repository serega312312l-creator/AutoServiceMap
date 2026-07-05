import { useCallback, useEffect, useState } from "react";
import { SosContact, SafetyTimerState } from "@/types/sos";
import {
  getSosContacts,
  saveSosContact,
  deleteSosContact,
  shareLocation,
  sendSosToContacts,
  getSafetyTimer,
  startSafetyTimer,
  stopSafetyTimer,
  checkSafetyTimerExpired,
} from "@/services/sosService";

export function useSos() {
  const [contacts, setContacts] = useState<SosContact[]>([]);
  const [timer, setTimer] = useState<SafetyTimerState>({
    active: false,
    durationMinutes: 30,
    contactsNotified: false,
  });

  const refresh = useCallback(async () => {
    const [c, t] = await Promise.all([getSosContacts(), getSafetyTimer()]);
    setContacts(c);
    setTimer(t);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return {
    contacts,
    timer,
    refresh,
    saveContact: async (c: Parameters<typeof saveSosContact>[0]) => {
      await saveSosContact(c);
      await refresh();
    },
    deleteContact: async (id: string) => {
      await deleteSosContact(id);
      await refresh();
    },
    shareLoc: shareLocation,
    sendSos: sendSosToContacts,
    startTimer: async (mins: number) => {
      await startSafetyTimer(mins);
      await refresh();
    },
    stopTimer: async () => {
      await stopSafetyTimer();
      await refresh();
    },
    checkTimer: checkSafetyTimerExpired,
  };
}
