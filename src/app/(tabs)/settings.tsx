import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, Switch, Modal, StyleSheet } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { GlassCard } from '@/components/ui/GlassCard';
import { router } from 'expo-router';
import { showComingSoon } from '@/utils/feedback';
import { CyberSlider } from '@/components/ui/CyberSlider';
import { useAuthStore } from '@/store/authStore';
import { signOut } from 'firebase/auth';
import { auth } from '@/config/firebaseConfig';
import { useSettingsStore } from '@/store/settingsStore';

export default function SettingsScreen() {
  const { 
    mockMode, 
    setMockMode,
    emergencyAlertsEnabled,
    setEmergencyAlertsEnabled,
    sensorAlertsEnabled,
    setSensorAlertsEnabled,
    sensitivityThresholds,
    setThresholds
  } = useSettingsStore();
  const [protocol, setProtocol] = useState('HTTP');
  
  const { logout } = useAuthStore();
  const [currentUser, setCurrentUser] = useState(auth.currentUser);
  const [profileModalVisible, setProfileModalVisible] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setCurrentUser(user);
    });
    return unsubscribe;
  }, []);

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
          onPress={() => setProfileModalVisible(true)}
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
              value={sensitivityThresholds.ultrasonic}
              min={10}
              max={400}
              unit="cm"
              onChange={(val) => setThresholds(Math.round(val), sensitivityThresholds.force)}
            />

            <CyberSlider 
              label="Force Threshold"
              value={sensitivityThresholds.force}
              min={100}
              max={2000}
              unit="N"
              onChange={(val) => setThresholds(sensitivityThresholds.ultrasonic, Math.round(val))}
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
                value={emergencyAlertsEnabled} 
                onValueChange={setEmergencyAlertsEnabled}
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
                value={sensorAlertsEnabled} 
                onValueChange={setSensorAlertsEnabled}
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
              onPress={() => setProfileModalVisible(true)}
              className="p-5 flex-row items-center justify-between border-b border-white/5"
            >
              <View className="flex-row items-center">
                <View className="w-10 h-10 bg-primary/10 rounded-full items-center justify-center mr-4 border border-primary/20">
                  <FontAwesome5 name="user" size={16} color="#00E5FF" />
                </View>
                <View>
                  <Text className="text-white font-bold">{currentUser?.displayName || 'Admin User'}</Text>
                  <Text className="text-white/40 text-xs">{currentUser?.email || 'admin@shieldnet.local'}</Text>
                </View>
              </View>
              <FontAwesome5 name="chevron-right" size={14} color="rgba(255,255,255,0.2)" />
            </TouchableOpacity>
            
            <TouchableOpacity 
              onPress={() => router.push('/(tabs)/contacts')}
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
              onPress={async () => {
                try {
                  await signOut(auth);
                  logout();
                  router.replace('/(auth)/login');
                } catch (error) {
                  console.error('Failed to sign out:', error);
                }
              }}
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

      {/* 2. Bespoke Dynamic Profile Details Card Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={profileModalVisible}
        onRequestClose={() => setProfileModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <GlassCard style={styles.modalContent} className="p-8 border border-white/10">
            {/* Terminal Top Accent */}
            <View className="flex-row items-center justify-between mb-8 border-b border-white/5 pb-4">
              <View className="flex-row items-center">
                <View className="w-2.5 h-2.5 rounded-full bg-[#00E5FF] mr-2 neon-shadow-blue" />
                <Text className="text-white/40 font-mono text-[10px] tracking-[2px] uppercase">Profile Decrypt</Text>
              </View>
              <TouchableOpacity onPress={() => setProfileModalVisible(false)}>
                <FontAwesome5 name="times" size={18} color="rgba(255,255,255,0.4)" />
              </TouchableOpacity>
            </View>

            {/* Glowing Big Profile Avatar Badge */}
            <View className="w-24 h-24 rounded-full bg-[#00E5FF]/10 items-center justify-center mb-6 border-2 border-[#00E5FF] self-center neon-shadow-blue">
              <Text className="text-[#00E5FF] text-4xl font-bold">
                {currentUser?.displayName ? currentUser.displayName.charAt(0).toUpperCase() : 'U'}
              </Text>
            </View>

            {/* Full Name display */}
            <Text className="text-white text-2xl font-bold text-center mb-1">{currentUser?.displayName || 'Admin User'}</Text>
            <Text className="text-[#00E5FF] text-xs font-mono text-center mb-8 uppercase tracking-[3px]">ACTIVE PREMISES GUARD</Text>

            {/* Decrypted Information Table */}
            <View className="space-y-4 bg-black/30 border border-white/5 rounded-2xl p-5 mb-8">
              {/* Security ID (UID) */}
              <View className="border-b border-white/5 pb-3">
                <Text className="text-white/40 text-[9px] font-bold uppercase tracking-wider mb-1">Security Node ID (UID)</Text>
                <Text className="text-white font-mono text-xs select-all">{currentUser?.uid || 'MOCK_UID_LOCAL'}</Text>
              </View>

              {/* Registered Email */}
              <View className="border-b border-white/5 py-3">
                <Text className="text-white/40 text-[9px] font-bold uppercase tracking-wider mb-1">Registered Endpoint (Email)</Text>
                <Text className="text-white font-medium text-sm">{currentUser?.email || 'admin@shieldnet.local'}</Text>
              </View>

              {/* Account Enrollment Timestamp */}
              <View className="pt-3">
                <Text className="text-white/40 text-[9px] font-bold uppercase tracking-wider mb-1">Enrollment Date</Text>
                <Text className="text-white font-medium text-sm">
                  {currentUser?.metadata.creationTime ? new Date(currentUser.metadata.creationTime).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  }) : 'Active Enrolled Node'}
                </Text>
              </View>
            </View>

            {/* Action Buttons */}
            <TouchableOpacity 
              onPress={() => setProfileModalVisible(false)}
              className="bg-[#00E5FF] py-4 rounded-2xl w-full items-center justify-center neon-shadow-blue"
            >
              <Text className="text-[#0F172A] font-bold text-base uppercase tracking-[2px]">Close Terminal</Text>
            </TouchableOpacity>
          </GlassCard>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(2, 6, 23, 0.95)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    borderRadius: 40,
    backgroundColor: '#0F172A',
  }
});
