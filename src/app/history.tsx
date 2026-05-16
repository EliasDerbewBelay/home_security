import React from 'react';
import { View, Text, FlatList } from 'react-native';
import { GlassCard } from '@/components/ui/GlassCard';
import { useSensorStore } from '@/store/sensorStore';
import { FontAwesome5 } from '@expo/vector-icons';

export default function HistoryScreen() {
  const { history } = useSensorStore();

  return (
    <View className="flex-1 bg-background p-4 pt-12">
      <View className="flex-row items-center mb-6">
        <FontAwesome5 name="history" size={24} color="#00E5FF" />
        <Text className="text-white text-3xl font-bold ml-4">Activity Log</Text>
      </View>

      <FlatList 
        data={history}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <GlassCard className="mb-3 flex-row items-center justify-between">
            <View className="flex-row items-center">
              <View className={`w-10 h-10 rounded-lg items-center justify-center ${item.triggered ? 'bg-danger/20' : 'bg-white/5'}`}>
                <FontAwesome5 
                  name={item.type === 'ultrasonic' ? 'wave-square' : 'shoe-prints'} 
                  size={16} 
                  color={item.triggered ? '#FF1744' : '#64748B'} 
                />
              </View>
              <View className="ml-4">
                <Text className="text-white font-bold">{item.type.toUpperCase()}</Text>
                <Text className="text-white/40 text-xs">
                  {new Date(item.timestamp).toLocaleTimeString()}
                </Text>
              </View>
            </View>
            <View className="items-end">
              <Text className={`font-bold ${item.triggered ? 'text-danger' : 'text-primary'}`}>
                {item.value} {item.type === 'ultrasonic' ? 'cm' : 'pts'}
              </Text>
              <Text className="text-white/40 text-[10px]">VALUE</Text>
            </View>
          </GlassCard>
        )}
        ListEmptyComponent={
          <View className="flex-1 items-center justify-center mt-20">
            <FontAwesome5 name="ghost" size={50} color="rgba(255,255,255,0.1)" />
            <Text className="text-white/20 mt-4">No recent activity detected</Text>
          </View>
        }
      />
    </View>
  );
}
