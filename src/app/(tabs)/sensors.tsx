import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { GlassCard } from '@/components/ui/GlassCard';
import { SensorRow } from '@/components/ui/SensorRow';
import { useSensorStore } from '@/store/sensorStore';
import { FontAwesome5 } from '@expo/vector-icons';

export default function SensorsScreen() {
  const { latestUltrasonic, latestForce } = useSensorStore();

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
          value={`${((latestUltrasonic?.value ?? 0) / 100).toFixed(1)}m`}
          icon="broadcast-tower"
          progress={Math.min((latestUltrasonic?.value ?? 0) / 400, 1)}
        />

        <SensorRow 
          name="Kitchen Window" 
          status="Force Pressure" 
          value={`${latestForce?.value ?? 0}pts`}
          icon="shoe-prints"
          progress={Math.min((latestForce?.value ?? 0) / 1024, 1)}
        />

        <View className="mt-8">
          <Text className="text-white/40 text-[10px] font-bold tracking-[4px] uppercase mb-4">NETWORK NODES</Text>
          <GlassCard className="mb-3 p-4 flex-row items-center justify-between">
            <View className="flex-row items-center">
              <FontAwesome5 name="microchip" size={16} color="#00E676" />
              <Text className="text-white ml-4 font-bold">Node-ESP8266-01</Text>
            </View>
            <Text className="text-secondary font-bold">ONLINE</Text>
          </GlassCard>
        </View>
      </ScrollView>
    </View>
  );
}
