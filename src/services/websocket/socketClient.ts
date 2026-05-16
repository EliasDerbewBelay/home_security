import { io, Socket } from 'socket.io-client';
import { SensorEvent, DeviceStatus, HardwareCommand } from '@/types';

class SocketClient {
  private socket: Socket | null = null;
  private onEventCallback: ((event: SensorEvent) => void) | null = null;
  private onStatusCallback: ((status: DeviceStatus) => void) | null = null;

  connect(url: string) {
    if (this.socket) this.socket.disconnect();

    this.socket = io(url);

    this.socket.on('connect', () => {
      console.log('Socket.IO Connected');
    });

    this.socket.on('sensor_event', (event: SensorEvent) => {
      this.onEventCallback?.(event);
    });

    this.socket.on('device_status', (status: DeviceStatus) => {
      this.onStatusCallback?.(status);
    });
  }

  disconnect() {
    this.socket?.disconnect();
    this.socket = null;
  }

  onSensorEvent(callback: (event: SensorEvent) => void) {
    this.onEventCallback = callback;
  }

  onDeviceStatus(callback: (status: DeviceStatus) => void) {
    this.onStatusCallback = callback;
  }

  sendCommand(command: HardwareCommand) {
    this.socket?.emit('command', command);
  }
}

export const socketClient = new SocketClient();
