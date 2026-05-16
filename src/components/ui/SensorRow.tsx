import React from 'react';
import { View, Text } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { GlassCard } from './GlassCard';

interface SensorRowProps {
  name: string;
  status: string;
  value: string;
  icon: string;
  progress: number; // 0 to 1
  className?: string;
}

export const SensorRow: React.FC<SensorRowProps> = ({ 
  name, 
  status, 
  value, 
  icon, 
  progress,
  className = '' 
}) => {
  return (
    <GlassCard className={`flex-row items-center justify-between mb-3 p-4 ${className}`}>
      <View className="flex-row items-center">
        <View className="w-12 h-12 rounded-xl bg-white/5 items-center justify-center mr-4 border border-white/10">
          <FontAwesome5 name={icon} size={20} color="#00E5FF" />
        </View>
        <View>
          <Text className="text-white font-bold text-lg">{name}</Text>
          <Text className="text-primary text-[10px] font-bold tracking-tighter uppercase">
            {status}
          </Text>
        </View>
      </View>
      
      <View className="items-end">
        <Text className="text-white text-xl font-bold mb-2">{value}</Text>
        <View className="w-24 h-1.5 bg-white/10 rounded-full overflow-hidden">
          <View 
            className="h-full bg-primary" 
            style={{ width: `${progress * 100}%` }} 
          />
        </View>
      </View>
    </GlassCard>
  );
};
