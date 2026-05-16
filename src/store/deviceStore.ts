import { create } from 'zustand';
import { DeviceStatus } from '@/types';

interface DeviceState {
  status: DeviceStatus;
  setStatus: (status: DeviceStatus) => void;
  setArmed: (armed: boolean) => void;
}

export const useDeviceStore = create<DeviceState>((set) => ({
  status: {
    connected: false,
    ip: '0.0.0.0',
    rssi: 0,
    armed: false,
    lastSeen: new Date().toISOString(),
  },

  setStatus: (status) => set({ status }),
  setArmed: (armed) => set((state) => ({ 
    status: { ...state.status, armed } 
  })),
}));
