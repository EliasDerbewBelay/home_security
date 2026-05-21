import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { GlassCard } from '@/components/ui/GlassCard';
import { SensorRow } from '@/components/ui/SensorRow';
import { useSensorStore } from '@/store/sensorStore';
import { useDeviceStore } from '@/store/deviceStore';
import { useSettingsStore } from '@/store/settingsStore';
import { FontAwesome5 } from '@expo/vector-icons';

export default function SensorsScreen() {
  const { distance } = useSensorStore();
  const { connected } = useDeviceStore();
  const { apiUrl } = useSettingsStore();

  return (
    <View className="flex-1 bg-background p-4 pt-12">
      <View className="flex-row items-center mb-6">
        <FontAwesome5 name="broadcast-tower" size={24} color="#00E5FF" />
        <Text className="text-white text-3xl font-bold ml-4">Sensors</Text>
      </View>

      <ScrollView className="flex-1">
        <Text className="text-white/40 text-[10px] font-bold tracking-[4px] uppercase mb-4">ACTIVE HARDWARE</Text>
        
        <SensorRow 
          name="Front Entry" 
          status="Ultrasonic Proximity" 
          value={`${((distance ?? 0) / 100).toFixed(1)}m`}
          icon="broadcast-tower"
          progress={Math.min((distance ?? 0) / 400, 1)}
        />



        <View className="mt-8">
          <Text className="text-white/40 text-[10px] font-bold tracking-[4px] uppercase mb-4">NETWORK NODES</Text>
          <GlassCard className="mb-3 p-4 flex-row items-center justify-between">
            <View className="flex-row items-center">
              <FontAwesome5 name="microchip" size={16} color={connected ? '#00E676' : '#FF1744'} />
              <View className="ml-4">
                <Text className="text-white font-bold">Node-ESP8266-01</Text>
                <Text className="text-white/40 text-xs font-mono">{apiUrl.replace(/^https?:\/\//, '')}</Text>
              </View>
            </View>
            <View className="flex-row items-center">
              <View className={`w-2 h-2 rounded-full mr-2 ${connected ? 'bg-secondary' : 'bg-danger'}`} />
              <Text className={`font-bold ${connected ? 'text-secondary' : 'text-danger'}`}>
                {connected ? 'ONLINE' : 'OFFLINE'}
              </Text>
            </View>
          </GlassCard>
        </View>
      </ScrollView>
    </View>
  );
}

