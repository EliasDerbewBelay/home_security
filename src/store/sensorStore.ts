import { create } from 'zustand';

interface SensorState {
  distance: number | null       // Ultrasonic cm value
  buzzerActive: boolean         // true when buzzer is ON
  triggered: boolean            // true when object detected
  lastUpdated: string | null    // ISO timestamp
  updateSensor: (data: Partial<SensorState>) => void
}

export const useSensorStore = create<SensorState>((set) => ({
  distance: null,
  buzzerActive: false,
  triggered: false,
  lastUpdated: null,

  updateSensor: (data) => set((state) => ({ ...state, ...data })),
}));
