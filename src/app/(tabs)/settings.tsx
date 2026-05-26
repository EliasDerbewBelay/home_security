import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, Modal, StyleSheet, TextInput, Alert } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { GlassCard } from '@/components/ui/GlassCard';
import { router } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import { signOut } from 'firebase/auth';
import { auth, db } from '@/config/firebaseConfig';
import { doc, setDoc } from 'firebase/firestore';
import { useSettingsStore } from '@/store/settingsStore';
import { hardwareService } from '@/services/hardware/hardwareService';

export default function SettingsScreen() {
  const { 
    apiUrl,
    setApiConfig,
    pollInterval,
    setPollInterval
  } = useSettingsStore();
  
  const espIp = apiUrl.replace(/^https?:\/\//, '').replace(/:\d+$/, '');
  const [editingIp, setEditingIp] = useState(espIp);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<'success' | 'fail' | null>(null);
  
  const { logout } = useAuthStore();
  const [currentUser, setCurrentUser] = useState(auth.currentUser);
  const [profileModalVisible, setProfileModalVisible] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setCurrentUser(user);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    setEditingIp(espIp);
  }, [espIp]);

  const saveSettingsToFirestore = async (ip: string, interval: number) => {
    if (currentUser) {
      try {
        await setDoc(doc(db, 'users', currentUser.uid, 'settings', 'hardware'), {
          espIp: ip,
          pollInterval: interval,
          updatedAt: new Date().toISOString()
        }, { merge: true });
      } catch (e) {
        console.error("Failed to save settings to Firestore", e);
      }
    }
  };

  const handleIpSubmit = () => {
    let trimmed = editingIp.trim();
    // Remove any protocol and trailing slashes if the user pasted a full URL
    trimmed = trimmed.replace(/^https?:\/\//, '').replace(/\/$/, '');
    
    if (trimmed && trimmed !== espIp) {
      setApiConfig(`http://${trimmed}`);
      saveSettingsToFirestore(trimmed, pollInterval);
      setEditingIp(trimmed); // Update the input field to reflect the cleaned IP
    }
  };

  const handleIntervalChange = (interval: number) => {
    setPollInterval(interval);
    saveSettingsToFirestore(espIp, interval);
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    const success = await hardwareService.checkOnline(`http://${editingIp.trim()}`);
    setTestResult(success ? 'success' : 'fail');
    setIsTesting(false);
  };

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
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
        {/* Hardware Section */}
        <SectionHeader title="ESP8266 Hardware" />
        <View className="px-4">
          <GlassCard className="p-6">
            <Text className="text-white/60 text-xs mb-6 leading-relaxed">
              Ensure your phone is connected to the same WiFi network as the device.
            </Text>

            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-white/80 text-lg font-medium">IP Address</Text>
              <TextInput
                value={editingIp}
                onChangeText={setEditingIp}
                onBlur={handleIpSubmit}
                onSubmitEditing={handleIpSubmit}
                className="text-secondary font-mono text-lg bg-black/40 px-4 py-2 rounded-lg border border-white/10 text-right"
                style={{ minWidth: 160, color: '#00E676' }}
                placeholderTextColor="rgba(255,255,255,0.2)"
                placeholder="10.232.223.222"
                keyboardType="numeric"
                returnKeyType="done"
              />
            </View>

            <TouchableOpacity 
              onPress={handleTestConnection}
              disabled={isTesting}
              className={`py-3 rounded-xl items-center flex-row justify-center mb-2 ${isTesting ? 'bg-white/10' : 'bg-primary/20 border border-primary/40'}`}
            >
              <FontAwesome5 name={isTesting ? 'spinner' : 'wifi'} size={14} color={isTesting ? 'white' : '#00E5FF'} />
              <Text className={`font-bold ml-2 ${isTesting ? 'text-white' : 'text-primary'}`}>
                {isTesting ? 'Testing...' : 'Test Connection'}
              </Text>
            </TouchableOpacity>

            {testResult && (
              <Text className={`text-center text-xs font-bold mt-2 ${testResult === 'success' ? 'text-secondary' : 'text-danger'}`}>
                {testResult === 'success' ? 'Connection Successful!' : 'Connection Failed!'}
              </Text>
            )}

            <View className="h-[1px] bg-white/10 my-6" />

            <Text className="text-white/40 text-xs font-bold uppercase mb-3">Poll Interval</Text>
            <View className="flex-row bg-black/40 p-1 rounded-xl border border-white/5">
              {[500, 1000, 2000].map((interval) => (
                <TouchableOpacity 
                  key={interval}
                  onPress={() => handleIntervalChange(interval)}
                  className={`flex-1 py-3 rounded-lg items-center ${pollInterval === interval ? 'bg-secondary' : ''}`}
                >
                  <Text className={`font-bold text-xs ${pollInterval === interval ? 'text-background' : 'text-white/40'}`}>
                    {interval}ms
                  </Text>
                </TouchableOpacity>
              ))}
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
