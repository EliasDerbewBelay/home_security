import React from 'react';
import { ScrollView, View, Text, TouchableOpacity, Image } from 'react-native';
import { GlassCard } from '@/components/ui/GlassCard';
import { MetricCard } from '@/components/ui/MetricCard';
import { SensorRow } from '@/components/ui/SensorRow';
import { ActivityChart } from '@/components/ui/ActivityChart';
import { useSensorStore } from '@/store/sensorStore';
import { useDeviceStore } from '@/store/deviceStore';
import { useSettingsStore } from '@/store/settingsStore';
import { FontAwesome5 } from '@expo/vector-icons';
import { hardwareService } from '@/services/hardware/hardwareService';
import { SecurityFloatingMenu } from '@/components/ui/SecurityFloatingMenu';
import { showComingSoon } from '@/utils/feedback';
import { router } from 'expo-router';
import { auth } from '@/config/firebaseConfig';
import { signOut } from 'firebase/auth';

export default function DashboardScreen() {
  const { latestUltrasonic, latestForce } = useSensorStore();
  const { status, setArmed } = useDeviceStore();
  const { mockMode } = useSettingsStore();

  const currentUser = auth.currentUser;
  const displayName = currentUser?.displayName || 'User';

  const toggleArmed = () => {
    const newArmedState = !status.armed;
    setArmed(newArmedState);
    hardwareService.sendCommand({ action: newArmedState ? 'arm' : 'disarm' });
  };

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

        {/* Security Hub Card */}
        <GlassCard 
          className="mb-8 p-8 items-center"
          neonColor={status.armed ? 'blue' : 'none'}
        >
          <View className={`w-32 h-32 rounded-full items-center justify-center mb-6 ${status.armed ? 'neon-shadow-blue bg-primary/20' : 'bg-white/5 border border-white/10'}`}>
            <FontAwesome5 
              name="shield-alt" 
              size={60} 
              color={status.armed ? '#00E5FF' : 'rgba(255,255,255,0.1)'} 
            />
          </View>
          
          <View className="flex-row items-center mb-4">
            <FontAwesome5 name={status.armed ? 'lock' : 'lock-open'} size={24} color="#00E676" />
            <Text className="text-secondary text-4xl font-bold ml-4 tracking-tighter">
              {status.armed ? 'ARMED' : 'DISARMED'}
            </Text>
          </View>

          <View className="flex-row items-center bg-black/40 px-4 py-1.5 rounded-full border border-white/5">
            <View className="w-2 h-2 bg-primary rounded-full mr-3 neon-shadow-blue" />
            <Text className="text-primary text-[10px] font-bold tracking-widest uppercase">
              ESP8266 CONNECTED
            </Text>
          </View>

          <View className="w-full flex-row justify-between items-center mt-8 pt-6 border-t border-white/5">
            <Text className="text-white/60 font-bold">System Defense</Text>
            <TouchableOpacity 
              onPress={toggleArmed}
              className={`w-14 h-7 rounded-full p-1 ${status.armed ? 'bg-secondary' : 'bg-white/10'}`}
            >
              <View className={`w-5 h-5 bg-white rounded-full ${status.armed ? 'ml-auto' : ''}`} />
            </TouchableOpacity>
          </View>
        </GlassCard>

        {/* KPI Row */}
        <View className="flex-row space-x-3 mb-8">
          <TouchableOpacity className="flex-1" onPress={() => router.push('/history')}>
            <MetricCard label="Alerts" value={0} />
          </TouchableOpacity>
          <TouchableOpacity className="flex-1" onPress={() => router.push('/sensors')}>
            <MetricCard label="Sensors" value={12} />
          </TouchableOpacity>
          <TouchableOpacity className="flex-1" onPress={() => showComingSoon('System Uptime Details')}>
            <MetricCard label="Uptime" value="99.9%" isGreen />
          </TouchableOpacity>
        </View>

        {/* Live Sensors */}
        <Text className="text-white/40 text-[10px] font-bold tracking-[4px] uppercase mb-4">Live Sensors</Text>
        <SensorRow 
          name="Front Entry" 
          status="Ultrasonic Active" 
          value={`${((latestUltrasonic?.value ?? 240) / 100).toFixed(1)}m`}
          icon="broadcast-tower"
          progress={Math.min((latestUltrasonic?.value ?? 0) / 400, 1)}
        />
        <SensorRow 
          name="Kitchen Window" 
          status="Force Stable" 
          value={`${latestForce?.value ?? 0}kg`}
          icon="th-large"
          progress={Math.min((latestForce?.value ?? 0) / 1024, 1)}
        />

        {/* Activity Chart */}
        <View className="mt-8 mb-24 p-6 glass-card rounded-3xl">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-white/40 text-[10px] font-bold tracking-widest uppercase">Activity - Last Hour</Text>
            <FontAwesome5 name="redo-alt" size={12} color="rgba(255,255,255,0.2)" />
          </View>
          <ActivityChart />
        </View>
      </ScrollView>

      {/* Animated Security Menu */}
      <SecurityFloatingMenu />
    </View>
  );
}



