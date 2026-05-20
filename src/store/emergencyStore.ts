import { create } from 'zustand';

interface EmergencyAlertInfo {
  source: string;
  value: number;
  severity: 'high' | 'medium';
}

interface EmergencyState {
  isActive: boolean;
  currentAlert: EmergencyAlertInfo | null;
  triggerEmergency: (alert: EmergencyAlertInfo) => void;
  resolveEmergency: () => void;
}

export const useEmergencyStore = create<EmergencyState>((set) => ({
  isActive: false,
  currentAlert: null,

  triggerEmergency: (alert) => set({
    isActive: true,
    currentAlert: alert
  }),

  resolveEmergency: () => set({
    isActive: false,
    currentAlert: null
  }),
}));
