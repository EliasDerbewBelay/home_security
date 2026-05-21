import { create } from 'zustand';
import { SensorEvent } from '@/types';

interface SensorState {
  distance: number | null       // Ultrasonic cm value
  buzzerActive: boolean         // true when buzzer is ON
  triggered: boolean            // true when object detected
  lastUpdated: string | null    // ISO timestamp
  history: SensorEvent[]        // History of sensor events
  updateSensor: (data: Partial<SensorState>) => void
}

export const useSensorStore = create<SensorState>((set) => ({
  distance: null,
  buzzerActive: false,
  triggered: false,
  lastUpdated: null,
  history: [],

  updateSensor: (data) => set((state) => {
    let newHistory = state.history;
    
    if (data.distance !== undefined && data.lastUpdated !== undefined) {
      const event: SensorEvent = {
        id: Math.random().toString(36).substring(2, 11),
        type: 'ultrasonic',
        value: data.distance !== null ? data.distance : 0,
        triggered: data.triggered !== undefined ? data.triggered : state.triggered,
        timestamp: data.lastUpdated || new Date().toISOString(),
      };
      newHistory = [event, ...state.history].slice(0, 50);
    }
    
    return { ...state, ...data, history: newHistory };
  }),
}));
