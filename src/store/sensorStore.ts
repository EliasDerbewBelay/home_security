import { create } from 'zustand';
import { SensorEvent } from '@/types';

interface SensorState {
  latestUltrasonic: SensorEvent | null;
  latestForce: SensorEvent | null;
  history: SensorEvent[];
  addEvent: (event: SensorEvent) => void;
  clearHistory: () => void;
}

export const useSensorStore = create<SensorState>((set) => ({
  latestUltrasonic: null,
  latestForce: null,
  history: [],

  addEvent: (event) => set((state) => {
    const updatedHistory = [event, ...state.history].slice(0, 100); // Keep last 100
    if (event.type === 'ultrasonic') {
      return { latestUltrasonic: event, history: updatedHistory };
    } else {
      return { latestForce: event, history: updatedHistory };
    }
  }),

  clearHistory: () => set({ history: [], latestUltrasonic: null, latestForce: null }),
}));
