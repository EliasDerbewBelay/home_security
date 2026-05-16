import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Switch, Image, StyleSheet } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { GlassCard } from '@/components/ui/GlassCard';
import { router } from 'expo-router';
import { showComingSoon } from '@/utils/feedback';
import { CyberSlider } from '@/components/ui/CyberSlider';

export default function SettingsScreen() {
  const [emergencyAlerts, setEmergencyAlerts] = useState(true);
  const [sensorAlerts, setSensorAlerts] = useState(false);
  const [mockMode, setMockMode] = useState(false);
  const [protocol, setProtocol] = useState('HTTP');
  const [ultrasonicThreshold, setUltrasonicThreshold] = useState(45);
  const [forceSensitivity, setForceSensitivity] = useState(0.85);

  const SectionHeader = ({ title }: { title: string }) => (
    <Text className="text-white/40 text-[10px] font-bold tracking-[4px] uppercase px-6 mb-3 mt-8">
      {title}
    </Text>
  );

  return (
    <View className="flex-1 bg-background">
      {/* Header */}
      <View className="px-6 pt-16 pb-6 bg-[#0F172A] flex-row items-center justify-between border-b border-white/5">
        <TouchableOpacity 
          onPress={() => showComingSoon('User Account')}
          className="flex-row items-center"
        >
          <View className="w-12 h-12 rounded-full border-2 border-secondary overflow-hidden mr-4 neon-shadow-green">
            <Image 
              source={{ uri: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=120&auto=format&fit=crop' }} 
              className="w-full h-full"
            />
          </View>
          <Text className="text-white text-2xl font-bold">Settings</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          onPress={() => showComingSoon('Alert Preferences')}
          className="w-10 h-10 bg-white/5 rounded-xl items-center justify-center border border-white/10"
        >
          <FontAwesome5 name="bell" size={18} color="white" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
        {/* Hardware Section */}
        <SectionHeader title="Hardware" />
        <View className="px-4">
          <GlassCard className="p-6">
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-white/80 text-lg font-medium">ESP8266 IP</Text>
              <Text className="text-secondary font-mono text-lg">192.168.1.142</Text>
            </View>
            
            <View className="flex-row justify-between items-center mb-8">
              <Text className="text-white/80 text-lg font-medium">Port</Text>
              <View className="bg-black/40 px-4 py-2 rounded-lg border border-white/5 w-24 items-end">
                <Text className="text-white font-mono text-lg">8080</Text>
              </View>
            </View>

            <Text className="text-white/40 text-xs font-bold uppercase mb-3">Protocol</Text>
            <View className="flex-row bg-black/40 p-1 rounded-xl border border-white/5">
              {['HTTP', 'TCP', 'UDP'].map((p) => (
                <TouchableOpacity 
                  key={p}
                  onPress={() => setProtocol(p)}
                  className={`flex-1 py-3 rounded-lg items-center ${protocol === p ? 'bg-secondary' : ''}`}
                >
                  <Text className={`font-bold text-xs ${protocol === p ? 'text-background' : 'text-white/40'}`}>
                    {p}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </GlassCard>
        </View>

        {/* MQTT Section */}
        <SectionHeader title="MQTT" />
        <View className="px-4">
          <GlassCard className="p-6">
            <Text className="text-white/40 text-xs font-bold uppercase mb-2">Broker URL</Text>
            <View className="bg-black/60 p-4 rounded-xl border border-white/5 mb-6">
              <Text className="text-white/80 font-mono">mqtt://shieldnet.io:1883</Text>
            </View>

            <Text className="text-white/40 text-xs font-bold uppercase mb-2">Topic Prefix</Text>
            <View className="bg-black/60 p-4 rounded-xl border border-white/5">
              <Text className="text-white/80 font-mono">sn/node_01/</Text>
            </View>
          </GlassCard>
        </View>

        {/* Sensors Section */}
        <SectionHeader title="Sensors" />
        <View className="px-4">
          <GlassCard className="p-6">
            <CyberSlider 
              label="Ultrasonic Threshold"
              value={ultrasonicThreshold}
              min={10}
              max={400}
              unit="cm"
              onChange={setUltrasonicThreshold}
            />

            <CyberSlider 
              label="Force Sensitivity"
              value={forceSensitivity}
              min={0}
              max={5}
              unit="N"
              onChange={setForceSensitivity}
            />
          </GlassCard>
        </View>

        {/* Notifications Section */}
        <SectionHeader title="Notifications" />
        <View className="px-4">
          <GlassCard className="p-0 overflow-hidden">
            <View className="p-5 flex-row items-center justify-between border-b border-white/5">
              <View>
                <Text className="text-white font-bold">Emergency Alerts</Text>
                <Text className="text-white/40 text-xs">Critical breach attempts</Text>
              </View>
              <Switch 
                value={emergencyAlerts} 
                onValueChange={setEmergencyAlerts}
                trackColor={{ false: '#1E293B', true: '#00E676' }}
                thumbColor="#fff"
              />
            </View>
            <View className="p-5 flex-row items-center justify-between">
              <View>
                <Text className="text-white font-bold">Sensor Alerts</Text>
                <Text className="text-white/40 text-xs">Minor movement detected</Text>
              </View>
              <Switch 
                value={sensorAlerts} 
                onValueChange={setSensorAlerts}
                trackColor={{ false: '#1E293B', true: '#00E676' }}
                thumbColor="#fff"
              />
            </View>
          </GlassCard>
        </View>

        {/* Simulation Section */}
        <SectionHeader title="Simulation" />
        <View className="px-4">
          <GlassCard className="p-6">
            <View className="flex-row justify-between items-center mb-4">
              <View className="flex-row items-center">
                <Text className="text-white font-bold mr-3">Mock Mode</Text>
                <View className="bg-white/10 px-2 py-0.5 rounded border border-white/10">
                  <Text className="text-white/60 text-[8px] font-bold">DEV</Text>
                </View>
              </View>
              <Switch 
                value={mockMode} 
                onValueChange={setMockMode}
                trackColor={{ false: '#1E293B', true: '#00E676' }}
                thumbColor="#fff"
              />
            </View>
            <View className="flex-row bg-white/5 p-4 rounded-xl border border-white/5">
              <FontAwesome5 name="exclamation-triangle" size={14} color="rgba(255,255,255,0.4)" style={{ marginTop: 2 }} />
              <Text className="text-white/40 text-xs leading-relaxed ml-3 flex-1">
                Mock mode generates synthetic sensor data and bypasses hardware connection. Use for UI testing only.
              </Text>
            </View>
          </GlassCard>
        </View>

        {/* Account Section */}
        <SectionHeader title="Account" />
        <View className="px-4">
          <GlassCard className="p-0 overflow-hidden">
            <TouchableOpacity 
              onPress={() => showComingSoon('User Profiles')}
              className="p-5 flex-row items-center justify-between border-b border-white/5"
            >
              <View className="flex-row items-center">
                <View className="w-10 h-10 bg-primary/10 rounded-full items-center justify-center mr-4 border border-primary/20">
                  <FontAwesome5 name="user" size={16} color="#00E5FF" />
                </View>
                <View>
                  <Text className="text-white font-bold">Admin User</Text>
                  <Text className="text-white/40 text-xs">admin@shieldnet.local</Text>
                </View>
              </View>
              <FontAwesome5 name="chevron-right" size={14} color="rgba(255,255,255,0.2)" />
            </TouchableOpacity>
            
            <TouchableOpacity 
              onPress={() => router.push('/contacts')}
              className="p-5 flex-row items-center justify-between border-b border-white/5"
            >
              <View className="flex-row items-center">
                <View className="w-10 h-10 bg-secondary/10 rounded-full items-center justify-center mr-4 border border-secondary/20">
                  <FontAwesome5 name="address-book" size={16} color="#00E676" />
                </View>
                <Text className="text-white font-bold">Emergency Contacts</Text>
              </View>
              <FontAwesome5 name="chevron-right" size={14} color="rgba(255,255,255,0.2)" />
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={() => router.replace('/login')}
              className="p-5 flex-row items-center"
            >
              <View className="w-10 h-10 bg-danger/10 rounded-full items-center justify-center mr-4 border border-danger/20">
                <FontAwesome5 name="sign-out-alt" size={16} color="#FF1744" />
              </View>
              <Text className="text-white font-bold">Sign Out</Text>
            </TouchableOpacity>
          </GlassCard>
        </View>
      </ScrollView>
    </View>
  );
}
