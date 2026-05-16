import { create } from 'zustand';
import { EmergencyAlert } from '@/types';

interface EmergencyState {
  activeAlert: EmergencyAlert | null;
  alertHistory: EmergencyAlert[];
  isCountdownActive: boolean;
  triggerAlert: (alert: EmergencyAlert) => void;
  resolveAlert: (id: string) => void;
  setCountdownActive: (active: boolean) => void;
}

export const useEmergencyStore = create<EmergencyState>((set) => ({
  activeAlert: null,
  alertHistory: [],
  isCountdownActive: false,

  triggerAlert: (alert) => set((state) => ({
    activeAlert: alert,
    alertHistory: [alert, ...state.alertHistory],
    isCountdownActive: true
  })),

  resolveAlert: (id) => set((state) => ({
    activeAlert: state.activeAlert?.id === id ? null : state.activeAlert,
    alertHistory: state.alertHistory.map(a => a.id === id ? { ...a, resolved: true } : a),
    isCountdownActive: false
  })),

  setCountdownActive: (isCountdownActive) => set({ isCountdownActive }),
}));
