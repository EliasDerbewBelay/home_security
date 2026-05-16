import React from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { GlassCard } from '@/components/ui/GlassCard';
import { useSensorStore } from '@/store/sensorStore';
import { FontAwesome5 } from '@expo/vector-icons';
import { showComingSoon } from '@/utils/feedback';

export default function HistoryScreen() {
  const { history } = useSensorStore();
  const [filter, setFilter] = React.useState('ALL');

  const filteredHistory = history.filter(item => {
    if (filter === 'ALL') return true;
    if (filter === 'ALERTS') return item.triggered;
    if (filter === 'SENSORS') return !item.triggered;
    return true;
  });

  return (
    <View className="flex-1 bg-background">
      {/* Header */}
      <View className="px-6 pt-16 pb-6 bg-[#0F172A]">
        <View className="flex-row items-center justify-between mb-6">
          <View>
            <Text className="text-white/40 text-[10px] font-bold tracking-[4px] uppercase mb-1">Security Journal</Text>
            <Text className="text-white text-3xl font-bold">Activity Log</Text>
          </View>
          <TouchableOpacity 
            onPress={() => showComingSoon('Advanced Filter')}
            className="w-12 h-12 bg-white/5 rounded-2xl items-center justify-center border border-white/10"
          >
            <FontAwesome5 name="filter" size={16} color="#00E676" />
          </TouchableOpacity>
        </View>

        {/* Filter Chips */}
        <View className="flex-row space-x-3">
          {['ALL', 'ALERTS', 'SENSORS'].map((f) => (
            <TouchableOpacity 
              key={f}
              onPress={() => setFilter(f)}
              className={`px-6 py-2 rounded-full border ${filter === f ? 'bg-secondary border-secondary' : 'bg-white/5 border-white/10'} ml-2`}
            >
              <Text className={`font-bold text-xs ${filter === f ? 'text-background' : 'text-white/40'}`}>{f}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Timeline List */}
      <FlatList 
        data={filteredHistory}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 24, paddingBottom: 120 }}
        renderItem={({ item }) => (
          <View className="flex-row mb-8">
            {/* Timeline Line & Node */}
            <View className="items-center mr-6">
              <View className={`w-3 h-3 rounded-full ${item.triggered ? 'bg-danger neon-shadow-red' : 'bg-primary neon-shadow-blue'}`} />
              <View className="w-[1px] flex-1 bg-white/10 my-2" />
            </View>

            {/* Log Content */}
            <GlassCard className="flex-1 p-5 border-l-4" style={{ borderLeftColor: item.triggered ? '#FF1744' : '#00E5FF' }}>
              <View className="flex-row justify-between items-start mb-3">
                <View className="flex-row items-center">
                  <FontAwesome5 
                    name={item.type === 'ultrasonic' ? 'wave-square' : 'shoe-prints'} 
                    size={12} 
                    color={item.triggered ? '#FF1744' : 'rgba(255,255,255,0.4)'} 
                  />
                  <Text className="text-white/40 text-[10px] font-bold tracking-widest uppercase ml-2">
                    {item.type} SENSOR
                  </Text>
                </View>
                <Text className="text-white/20 text-[10px] font-bold">
                  {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </Text>
              </View>

              <Text className="text-white text-lg font-bold mb-1">
                {item.triggered ? 'Breach Detected' : 'Motion Recorded'}
              </Text>
              
              <View className="flex-row justify-between items-center mt-2 pt-3 border-t border-white/5">
                <View className="flex-row items-center">
                   <View className={`w-2 h-2 rounded-full mr-2 ${item.triggered ? 'bg-danger' : 'bg-secondary'}`} />
                   <Text className="text-white/60 text-xs font-bold uppercase">{item.triggered ? 'High Priority' : 'Normal'}</Text>
                </View>
                <Text className={`font-mono font-bold ${item.triggered ? 'text-danger' : 'text-primary'}`}>
                  {item.value}{item.type === 'ultrasonic' ? 'cm' : 'pts'}
                </Text>
              </View>
            </GlassCard>
          </View>
        )}
        ListEmptyComponent={
          <View className="items-center justify-center mt-20">
            <View className="w-20 h-20 bg-white/5 rounded-full items-center justify-center mb-6">
              <FontAwesome5 name="terminal" size={30} color="rgba(255,255,255,0.1)" />
            </View>
            <Text className="text-white/40 font-bold tracking-widest uppercase">No Records Found</Text>
          </View>
        }
      />
    </View>
  );
}

