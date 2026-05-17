import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppSettings, TransportProtocol } from '@/types';

interface SettingsState extends AppSettings {
  setProtocol: (protocol: TransportProtocol) => void;
  setMqttConfig: (url: string, port: string, topic: string) => void;
  setApiConfig: (apiUrl: string, socketUrl: string) => void;
  setMockMode: (enabled: boolean) => void;
  setThresholds: (ultrasonic: number, force: number) => void;
  setNotificationsEnabled: (enabled: boolean) => void;
  setEmergencyAlertsEnabled: (enabled: boolean) => void;
  setSensorAlertsEnabled: (enabled: boolean) => void;
  setBiometricsEnabled: (enabled: boolean) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      protocol: 'mqtt',
      mqttUrl: 'mqtt://broker.hivemq.com',
      mqttPort: '1883',
      mqttTopic: 'home/security/elias',
      apiUrl: 'http://192.168.1.100',
      socketUrl: 'ws://192.168.1.100:81',
      mockMode: false,
      sensitivityThresholds: {
        ultrasonic: 50,
        force: 700,
      },
      notificationsEnabled: true,
      emergencyAlertsEnabled: true,
      sensorAlertsEnabled: true,
      biometricsEnabled: false,

      setProtocol: (protocol) => set({ protocol }),
      setMqttConfig: (mqttUrl, mqttPort, mqttTopic) => set({ mqttUrl, mqttPort, mqttTopic }),
      setApiConfig: (apiUrl, socketUrl) => set({ apiUrl, socketUrl }),
      setMockMode: (mockMode) => set({ mockMode }),
      setThresholds: (ultrasonic, force) => 
        set((state) => ({ 
          sensitivityThresholds: { ...state.sensitivityThresholds, ultrasonic, force } 
        })),
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
