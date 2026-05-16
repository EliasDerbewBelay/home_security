export interface SensorEvent {
  id: string;
  type: 'ultrasonic' | 'force';
  value: number;
  triggered: boolean;
  timestamp: string;
}

export interface DeviceStatus {
  connected: boolean;
  ip: string;
  rssi: number;
  armed: boolean;
  lastSeen: string;
}

export interface EmergencyAlert {
  id: string;
  source: SensorEvent['type'];
  severity: 'low' | 'medium' | 'high';
  location: { lat: number; lng: number };
  resolved: boolean;
  createdAt: string;
}

export interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  type: 'police' | 'personal';
}

export interface HardwareCommand {
  action: 'arm' | 'disarm' | 'trigger_alarm' | 'stop_alarm';
  payload?: Record<string, unknown>;
}

export type TransportProtocol = 'mqtt' | 'websocket' | 'rest';

export interface AppSettings {
  protocol: TransportProtocol;
  mqttUrl: string;
  mqttPort: string;
  mqttTopic: string;
  apiUrl: string;
  socketUrl: string;
  mockMode: boolean;
  sensitivityThresholds: {
    ultrasonic: number;
    force: number;
  };
  notificationsEnabled: boolean;
  biometricsEnabled: boolean;
}
