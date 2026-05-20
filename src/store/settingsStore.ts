import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppSettings } from '@/types';

interface SettingsState extends AppSettings {
  pollInterval: number;
  setPollInterval: (interval: number) => void;
  setApiConfig: (apiUrl: string) => void;
  setNotificationsEnabled: (enabled: boolean) => void;
  setEmergencyAlertsEnabled: (enabled: boolean) => void;
  setSensorAlertsEnabled: (enabled: boolean) => void;
  setBiometricsEnabled: (enabled: boolean) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      apiUrl: 'http://10.232.223.222',
      pollInterval: 500,
      notificationsEnabled: true,
      emergencyAlertsEnabled: true,
      sensorAlertsEnabled: true,
      biometricsEnabled: false,

      setPollInterval: (interval) => set({ pollInterval: interval }),
      setApiConfig: (apiUrl) => set({ apiUrl }),
      setNotificationsEnabled: (notificationsEnabled) => set({ notificationsEnabled }),
      setEmergencyAlertsEnabled: (emergencyAlertsEnabled) => set({ emergencyAlertsEnabled }),
      setSensorAlertsEnabled: (sensorAlertsEnabled) => set({ sensorAlertsEnabled }),
      setBiometricsEnabled: (biometricsEnabled) => set({ biometricsEnabled }),
    }),
    {
      name: 'settings-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
