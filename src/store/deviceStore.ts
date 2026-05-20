import { create } from 'zustand';

interface DeviceState {
  connected: boolean            // true when ESP responds
  setDeviceStatus: (status: { connected: boolean }) => void
}

export const useDeviceStore = create<DeviceState>((set) => ({
  connected: false,
  setDeviceStatus: (status) => set({ connected: status.connected }),
}));
