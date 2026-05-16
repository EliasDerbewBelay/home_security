import React from 'react';
import { ScrollView, View, Text, Switch, TouchableOpacity, TextInput } from 'react-native';
import { GlassCard } from '@/components/ui/GlassCard';
import { useSettingsStore } from '@/store/settingsStore';
import { FontAwesome5 } from '@expo/vector-icons';

export default function SettingsScreen() {
  const settings = useSettingsStore();

  return (
    <ScrollView className="flex-1 bg-background p-4 pt-12">
      <Text className="text-white text-3xl font-bold mb-8">Settings</Text>

      {/* Connection Settings */}
      <Text className="text-white/60 text-xs font-bold mb-3 uppercase tracking-widest ml-1">Hardware Configuration</Text>
      <GlassCard className="mb-6">
        <View className="flex-row justify-between items-center mb-4">
          <View>
            <Text className="text-white font-bold">Mock Simulation</Text>
            <Text className="text-white/40 text-xs">Run app without ESP8266</Text>
          </View>
          <Switch 
            value={settings.mockMode} 
            onValueChange={settings.setMockMode}
            trackColor={{ false: '#1E293B', true: '#00E5FF' }}
          />
        </View>

        <View className="h-[1px] bg-white/10 mb-4" />

        <Text className="text-white/60 text-xs mb-2">Protocol</Text>
        <View className="flex-row space-x-2 mb-4">
          {['mqtt', 'websocket', 'rest'].map((p) => (
            <TouchableOpacity 
              key={p}
              onPress={() => settings.setProtocol(p as any)}
              className={`px-3 py-1 mr-2 rounded-lg border ${settings.protocol === p ? 'bg-primary/20 border-primary' : 'bg-white/5 border-white/10'}`}
            >
              <Text className={`text-xs font-bold ${settings.protocol === p ? 'text-primary' : 'text-white/40'}`}>
                {p.toUpperCase()}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </GlassCard>

      {/* Thresholds */}
      <Text className="text-white/60 text-xs font-bold mb-3 uppercase tracking-widest ml-1">Sensitivity Thresholds</Text>
      <GlassCard className="mb-6">
        <View className="mb-4">
          <Text className="text-white text-sm mb-2">Presence Distance (cm)</Text>
          <View className="bg-black/20 rounded-lg p-3 flex-row justify-between items-center">
            <Text className="text-white/40">Triggers alert when below</Text>
            <TextInput 
              className="text-primary font-bold text-lg"
              keyboardType="numeric"
              value={String(settings.sensitivityThresholds.ultrasonic)}
              onChangeText={(v) => settings.setThresholds(Number(v), settings.sensitivityThresholds.force)}
            />
          </View>
        </View>

        <View className="mb-2">
          <Text className="text-white text-sm mb-2">Footstep Pressure (pts)</Text>
          <View className="bg-black/20 rounded-lg p-3 flex-row justify-between items-center">
            <Text className="text-white/40">Triggers alert when above</Text>
            <TextInput 
              className="text-secondary font-bold text-lg"
              keyboardType="numeric"
              value={String(settings.sensitivityThresholds.force)}
              onChangeText={(v) => settings.setThresholds(settings.sensitivityThresholds.ultrasonic, Number(v))}
            />
          </View>
        </View>
      </GlassCard>

      {/* Security Settings */}
      <Text className="text-white/60 text-xs font-bold mb-3 uppercase tracking-widest ml-1">App Security</Text>
      <GlassCard className="mb-8">
        <View className="flex-row justify-between items-center">
          <View>
            <Text className="text-white font-bold">Biometric Login</Text>
            <Text className="text-white/40 text-xs">FaceID or Fingerprint</Text>
          </View>
          <Switch 
            value={settings.biometricsEnabled} 
            onValueChange={settings.setBiometricsEnabled}
            trackColor={{ false: '#1E293B', true: '#00E5FF' }}
          />
        </View>
      </GlassCard>

      <TouchableOpacity className="bg-white/5 border border-white/10 p-4 rounded-2xl items-center mb-10">
        <Text className="text-danger font-bold">LOGOUT</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
