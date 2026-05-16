import { SensorEvent, DeviceStatus } from '@/types';

class SimulationEngine {
  private intervalId: NodeJS.Timeout | null = null;
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
    
    // SAFE RANGES: 
    // Ultrasonic: 150-400 cm (no proximity danger)
    // Force: 0-100 pts (no pressure danger)
    const value = isUltrasonic 
      ? Math.floor(Math.random() * 250 + 150) 
      : Math.floor(Math.random() * 100);

    // No danger triggers for now
    const triggered = false;

    const event: SensorEvent = {
      id: Math.random().toString(36).substr(2, 9),
      type: isUltrasonic ? 'ultrasonic' : 'force',
      value,
      triggered,
      timestamp: new Date().toISOString(),
    };

    // Send safe events less frequently or normally
    if (Math.random() > 0.5) {
      this.onEventCallback?.(event);
    }
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
