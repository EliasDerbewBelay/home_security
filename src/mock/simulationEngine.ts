import { SensorEvent, DeviceStatus } from '@/types';
import { useSettingsStore } from '@/store/settingsStore';

class SimulationEngine {
  private intervalId: any = null;
  private onEventCallback: ((event: SensorEvent) => void) | null = null;
  private onStatusCallback: ((status: DeviceStatus) => void) | null = null;
  private isActive = false;

  start(intervalMs = 2000) {
    if (this.isActive) return;
    this.isActive = true;

    this.intervalId = setInterval(() => {
      this.generateRandomEvent();
      this.generateRandomStatus();
    }, intervalMs);
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isActive = false;
  }

  onSensorEvent(callback: (event: SensorEvent) => void) {
    this.onEventCallback = callback;
  }

  onDeviceStatus(callback: (status: DeviceStatus) => void) {
    this.onStatusCallback = callback;
  }

  private generateRandomEvent() {
    // Simulate a security breach attempt with 15% probability
    const isBreachAttempt = Math.random() < 0.15;
    
    let value: number;
    let triggered: boolean;

    if (isBreachAttempt) {
      // Simulate close proximity breach
      value = Math.floor(Math.random() * 15 + 5); // Proximity: 5 to 20 cm
    } else {
      // Safe, standard environmental readings
      value = Math.floor(Math.random() * 250 + 150); // Proximity: 150 to 400 cm
    }

    // Evaluate triggered state dynamically based on the live user settings thresholds
    const thresholds = useSettingsStore.getState().sensitivityThresholds;
    triggered = value <= thresholds.ultrasonic;

    const event: SensorEvent = {
      id: Math.random().toString(36).substring(2, 11),
      type: 'ultrasonic',
      value,
      triggered,
      timestamp: new Date().toISOString(),
    };

    // Forward the event in real-time
    this.onEventCallback?.(event);
  }

  private generateRandomStatus() {
    const status: DeviceStatus = {
      connected: true,
      ip: '192.168.1.101',
      rssi: -Math.floor(Math.random() * 40 + 40), // -40 to -80 dBm
      armed: true,
      lastSeen: new Date().toISOString(),
    };
    this.onStatusCallback?.(status);
  }
}

export const simulationEngine = new SimulationEngine();
