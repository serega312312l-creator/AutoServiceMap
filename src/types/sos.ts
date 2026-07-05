export interface SosContact {
  id: string;
  name: string;
  phone?: string;
  telegram?: string;
}

export interface SafetyTimerState {
  active: boolean;
  startedAt?: string;
  durationMinutes: number;
  contactsNotified: boolean;
}
