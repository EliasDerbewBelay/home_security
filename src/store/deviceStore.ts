import { create } from 'zustand';

interface DeviceState {
  connected: boolean            // true when ESP responds
  isArmed: boolean
  setDeviceStatus: (status: { connected: boolean }) => void
  setIsArmed: (armed: boolean) => void
}

export const useDeviceStore = create<DeviceState>((set) => ({
  connected: false,
  isArmed: true,
  setDeviceStatus: (status) => set({ connected: status.connected }),
  setIsArmed: (armed) => set({ isArmed: armed }),
}));
