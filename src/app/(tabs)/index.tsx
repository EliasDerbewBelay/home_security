import React, { useEffect, useRef } from 'react';
import { ScrollView, View, Text, TouchableOpacity, Animated } from 'react-native';
import { GlassCard } from '@/components/ui/GlassCard';
import { useSensorStore } from '@/store/sensorStore';
import { useDeviceStore } from '@/store/deviceStore';
import { FontAwesome5 } from '@expo/vector-icons';
import { useHardwarePolling } from '@/hooks/useHardwarePolling';

import { auth } from '@/config/firebaseConfig';
import { signOut } from 'firebase/auth';

export default function DashboardScreen() {
  const { distance, buzzerActive } = useSensorStore();
  const { connected, isArmed, setIsArmed } = useDeviceStore();
  const { startPolling, stopPolling } = useHardwarePolling();

  const currentUser = auth.currentUser;
  const displayName = currentUser?.displayName || 'User';

  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    startPolling();
    return () => stopPolling();
  }, []);

  useEffect(() => {
    if (buzzerActive) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.2, duration: 500, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 500, useNativeDriver: true })
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
      pulseAnim.stopAnimation();
    }
  }, [buzzerActive]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      console.error("Logout failed", e);
    }
  };

  return (
    <View className="flex-1 bg-background">
      <ScrollView className="flex-1 px-4 pt-12 pb-24">
        {/* Header */}
        <View className="flex-row justify-between items-center mb-8">
          <View className="flex-row items-center">
            <View className="w-10 h-10 rounded-full bg-white/10 items-center justify-center border border-white/20 overflow-hidden">
               <FontAwesome5 name="user" size={18} color="white" />
            </View>
            <View className="ml-4">
              <Text className="text-white/40 text-xs font-bold uppercase tracking-widest">Welcome back</Text>
              <Text className="text-white text-xl font-bold">Welcome, {displayName}!</Text>
            </View>
          </View>

          <TouchableOpacity 
            onPress={handleLogout}
            className="flex-row items-center bg-danger/20 border border-danger/50 px-4 py-2 rounded-full"
          >
            <FontAwesome5 name="sign-out-alt" size={12} color="#EF4444" />
            <Text className="text-danger ml-2 text-xs font-bold uppercase tracking-widest">Logout</Text>
          </TouchableOpacity>
        </View>

        {/* Connection Status Card */}
        <GlassCard className="mb-6 p-6 flex-row justify-between items-center">
          <Text className="text-white font-bold text-lg">System Status</Text>
          <View className={`flex-row items-center px-4 py-2 rounded-full border ${connected ? 'bg-primary/20 border-primary/50' : 'bg-danger/20 border-danger/50'}`}>
            <View className={`w-3 h-3 rounded-full mr-2 ${connected ? 'bg-primary neon-shadow-blue' : 'bg-danger neon-shadow-red'}`} />
            <Text className={`font-bold tracking-widest uppercase ${connected ? 'text-primary' : 'text-danger'}`}>
              {connected ? 'ONLINE' : 'OFFLINE'}
            </Text>
          </View>
        </GlassCard>

        {/* Security System Armed Status Card */}
        <GlassCard className="mb-6 p-6 flex-row justify-between items-center">
          <View className="flex-row items-center">
            <FontAwesome5 name="shield-alt" size={20} color={isArmed ? '#00E676' : '#94A3B8'} />
            <Text className="text-white font-bold text-lg ml-3">Security System</Text>
          </View>
          <TouchableOpacity 
            onPress={() => setIsArmed(!isArmed)}
            className={`px-4 py-2 rounded-full border ${isArmed ? 'bg-primary/20 border-primary/50' : 'bg-gray-500/20 border-gray-500/50'}`}
          >
            <Text className={`font-bold tracking-widest uppercase text-xs ${isArmed ? 'text-primary' : 'text-gray-400'}`}>
              {isArmed ? 'ARMED' : 'DISARMED'}
            </Text>
          </TouchableOpacity>
        </GlassCard>

        {/* Ultrasonic Sensor Card */}
        <GlassCard className="mb-6 p-6">
          <View className="flex-row justify-between items-center mb-4">
            <View className="flex-row items-center">
              <View className="w-10 h-10 rounded-full bg-white/10 items-center justify-center mr-3">
                <FontAwesome5 name="broadcast-tower" size={16} color="white" />
              </View>
              <Text className="text-white font-bold text-lg">Ultrasonic Range</Text>
            </View>
            <Text className="text-white text-3xl font-mono">
              {distance !== null ? `${distance.toFixed(1)} cm` : '--'}
            </Text>
          </View>

          <View className="w-full h-4 bg-black/40 rounded-full overflow-hidden border border-white/5 mb-4">
            <View 
              className={`h-full ${buzzerActive ? 'bg-danger' : 'bg-secondary'}`} 
              style={{ width: `${Math.min((distance || 0) / 400 * 100, 100)}%` }} 
            />
          </View>

          <View className="flex-row items-center justify-center">
            <Text className={`font-bold uppercase tracking-widest ${buzzerActive ? 'text-danger' : 'text-secondary'}`}>
              {buzzerActive ? 'Object Detected' : 'Area Clear'}
            </Text>
          </View>
        </GlassCard>

        {/* Buzzer Status Card */}
        <GlassCard className="mb-8 p-6 items-center justify-center">
          <Text className="text-white/60 font-bold uppercase tracking-widest mb-6">Physical Buzzer</Text>
          
          <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
            <View className={`w-32 h-32 rounded-full items-center justify-center border-4 ${buzzerActive ? 'bg-danger/20 border-danger neon-shadow-red' : 'bg-secondary/20 border-secondary neon-shadow-green'}`}>
              <FontAwesome5 
                name={buzzerActive ? 'bell' : 'bell-slash'} 
                size={40} 
                color={buzzerActive ? '#FF1744' : '#00E676'} 
              />
            </View>
          </Animated.View>
          
          <Text className={`mt-6 text-3xl font-bold uppercase tracking-widest ${buzzerActive ? 'text-danger' : 'text-secondary'}`}>
            {buzzerActive ? 'BUZZER ON' : 'BUZZER OFF'}
          </Text>
        </GlassCard>

      </ScrollView>


    </View>
  );
}
