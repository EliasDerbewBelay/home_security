import { 
  SensorEvent, 
  DeviceStatus, 
  HardwareCommand, 
  TransportProtocol 
} from '@/types';
import { mqttClient } from '../mqtt/mqttClient';
import { socketClient } from '../websocket/socketClient';
import { apiClient } from '../api/apiClient';

interface HardwareServiceConfig {
  protocol: TransportProtocol;
  mqttUrl: string;
  mqttTopicPrefix: string;
  socketUrl: string;
  mockMode: boolean;
}

class HardwareService {
  private config: HardwareServiceConfig | null = null;
  private onEventCallback: ((event: SensorEvent) => void) | null = null;
  private onStatusCallback: ((status: DeviceStatus) => void) | null = null;

  initialize(config: HardwareServiceConfig) {
    this.config = config;
    
    if (config.mockMode) {
      console.log('HardwareService: Mock Mode Active');
      return;
    }

    if (config.protocol === 'mqtt') {
      mqttClient.onSensorEvent((e) => this.onEventCallback?.(e));
      mqttClient.onDeviceStatus((s) => this.onStatusCallback?.(s));
      mqttClient.connect(config.mqttUrl, config.mqttTopicPrefix);
    } else if (config.protocol === 'websocket') {
      socketClient.onSensorEvent((e) => this.onEventCallback?.(e));
      socketClient.onDeviceStatus((s) => this.onStatusCallback?.(s));
      socketClient.connect(config.socketUrl);
    }
  }

  onSensorEvent(callback: (event: SensorEvent) => void) {
    this.onEventCallback = callback;
  }

  onDeviceStatus(callback: (status: DeviceStatus) => void) {
    this.onStatusCallback = callback;
  }

  async sendCommand(command: HardwareCommand) {
    if (this.config?.mockMode) {
      console.log('HardwareService (Mock): Sending command', command);
      return;
    }

    switch (this.config?.protocol) {
      case 'mqtt':
        mqttClient.sendCommand(this.config.mqttTopicPrefix, command);
        break;
      case 'websocket':
        socketClient.sendCommand(command);
        break;
      case 'rest':
        await apiClient.post('/command', command);
        break;
    }
  }

  disconnect() {
    mqttClient.disconnect();
    socketClient.disconnect();
  }
}

export const hardwareService = new HardwareService();
