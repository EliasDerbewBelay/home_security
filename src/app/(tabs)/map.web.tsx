import React from 'react';
import { View, Text } from 'react-native';
import { GlassCard } from '@/components/ui/GlassCard';
import { FontAwesome5 } from '@expo/vector-icons';

export default function MapScreen() {
  const homeLocation = {
    latitude: 37.78825,
    longitude: -122.4324,
  };

  return (
    <View className="flex-1 bg-background p-6 items-center justify-center">
      <GlassCard className="w-full max-w-md p-10 items-center">
        <View className="w-20 h-20 bg-primary/20 rounded-full items-center justify-center mb-6">
          <FontAwesome5 name="map-marked-alt" size={40} color="#00E5FF" />
        </View>
        <Text className="text-white text-xl font-bold mb-2">Maps on Web</Text>
        <Text className="text-white/40 text-center mb-6">
          React Native Maps is optimized for mobile devices. For the best experience, run the app on Android or iOS.
        </Text>
        <View className="w-full bg-white/5 rounded-xl p-4 border border-white/10">
          <Text className="text-white/60 text-xs mb-1">HOME COORDINATES</Text>
          <Text className="text-white font-mono">{homeLocation.latitude}, {homeLocation.longitude}</Text>
        </View>
      </GlassCard>
    </View>
  );
}
