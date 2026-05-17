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
    const isUltrasonic = Math.random() > 0.5;
    
    // Simulate a security breach attempt with 15% probability
    const isBreachAttempt = Math.random() < 0.15;
    
    let value: number;
    let triggered: boolean;

    if (isBreachAttempt) {
      // Simulate close proximity breach or heavy door force breach
      value = isUltrasonic 
        ? Math.floor(Math.random() * 15 + 5) // Proximity: 5 to 20 cm
        : Math.floor(Math.random() * 800 + 1200); // Force: 1200 to 2000 N
    } else {
      // Safe, standard environmental readings
      value = isUltrasonic 
        ? Math.floor(Math.random() * 250 + 150) // Proximity: 150 to 400 cm
        : Math.floor(Math.random() * 100); // Force: 0 to 100 N
    }

    // Evaluate triggered state dynamically based on the live user settings thresholds
    const thresholds = useSettingsStore.getState().sensitivityThresholds;
    if (isUltrasonic) {
      triggered = value <= thresholds.ultrasonic;
    } else {
      triggered = value >= thresholds.force;
    }

    const event: SensorEvent = {
      id: Math.random().toString(36).substring(2, 11),
      type: isUltrasonic ? 'ultrasonic' : 'force',
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
