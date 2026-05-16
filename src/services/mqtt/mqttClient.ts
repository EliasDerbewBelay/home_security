import mqtt from 'mqtt';
import { SensorEvent, DeviceStatus, HardwareCommand } from '@/types';

class MqttClient {
  private client: mqtt.MqttClient | null = null;
  private onEventCallback: ((event: SensorEvent) => void) | null = null;
  private onStatusCallback: ((status: DeviceStatus) => void) | null = null;

  connect(url: string, topicPrefix: string) {
    if (this.client) this.client.end();

    this.client = mqtt.connect(url);

    this.client.on('connect', () => {
      console.log('MQTT Connected');
      this.client?.subscribe(`${topicPrefix}/sensors/#`);
      this.client?.subscribe(`${topicPrefix}/status`);
    });

    this.client.on('message', (topic, message) => {
      try {
        const payload = JSON.parse(message.toString());
        if (topic.includes('/sensors/')) {
          this.onEventCallback?.(payload as SensorEvent);
        } else if (topic.endsWith('/status')) {
          this.onStatusCallback?.(payload as DeviceStatus);
        }
      } catch (e) {
        console.error('MQTT Parse Error', e);
      }
    });
  }

  disconnect() {
    this.client?.end();
    this.client = null;
  }

  onSensorEvent(callback: (event: SensorEvent) => void) {
    this.onEventCallback = callback;
  }

  onDeviceStatus(callback: (status: DeviceStatus) => void) {
    this.onStatusCallback = callback;
  }

  sendCommand(topicPrefix: string, command: HardwareCommand) {
    if (this.client?.connected) {
      this.client.publish(`${topicPrefix}/commands`, JSON.stringify(command));
    }
  }
}

export const mqttClient = new MqttClient();
