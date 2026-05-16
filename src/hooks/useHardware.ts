import { useEffect } from 'react';
import { hardwareService } from '@/services/hardware/hardwareService';
import { simulationEngine } from '@/mock/simulationEngine';
import { useSettingsStore } from '@/store/settingsStore';
import { useSensorStore } from '@/store/sensorStore';
import { useDeviceStore } from '@/store/deviceStore';
import { useEmergencyStore } from '@/store/emergencyStore';
import { SensorEvent, EmergencyAlert } from '@/types';

export const useHardware = () => {
  const settings = useSettingsStore();
  const { addEvent } = useSensorStore();
  const { setStatus } = useDeviceStore();
  const { triggerAlert } = useEmergencyStore();

  useEffect(() => {
    // Handle events from hardware or mock
    const handleEvent = (event: SensorEvent) => {
      addEvent(event);
      
      // Check if event triggers an emergency
      if (event.triggered) {
        const alert: EmergencyAlert = {
          id: `alert-${Date.now()}`,
          source: event.type,
          severity: 'high',
          location: { lat: 0, lng: 0 }, // Would come from device or GPS
          resolved: false,
          createdAt: new Date().toISOString(),
        };
        triggerAlert(alert);
      }
    };

    // Initialize hardware service
    hardwareService.onSensorEvent(handleEvent);
    hardwareService.onDeviceStatus(setStatus);
    
    hardwareService.initialize({
      protocol: settings.protocol,
      mqttUrl: settings.mqttUrl,
      mqttTopicPrefix: settings.mqttTopic,
      socketUrl: settings.socketUrl,
      mockMode: settings.mockMode,
    });

    // Initialize simulation if enabled
    if (settings.mockMode) {
      simulationEngine.onSensorEvent(handleEvent);
      simulationEngine.onDeviceStatus(setStatus);
      simulationEngine.start();
    }

    return () => {
      hardwareService.disconnect();
      simulationEngine.stop();
    };
  }, [
    settings.protocol, 
    settings.mqttUrl, 
    settings.mqttTopic, 
    settings.socketUrl, 
    settings.mockMode
  ]);
};
