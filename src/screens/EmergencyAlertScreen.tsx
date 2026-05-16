import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Modal, Vibration } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { useEmergencyStore } from '@/store/emergencyStore';
import { useSettingsStore } from '@/store/settingsStore';
import { Audio } from 'expo-av';
import * as Linking from 'expo-linking';
import { hardwareService } from '@/services/hardware/hardwareService';

export const EmergencyAlertScreen = () => {
  const { activeAlert, resolveAlert } = useEmergencyStore();
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [countdown, setCountdown] = useState(15);

  useEffect(() => {
    if (activeAlert) {
      playSiren();
      startVibration();
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => {
        clearInterval(timer);
        stopSiren();
        Vibration.cancel();
      };
    }
  }, [activeAlert]);

  async function playSiren() {
    try {
      // NOTE: To enable the siren, add a siren.mp3 file to src/assets/sounds/
      // and uncomment the line below.
      /*
      const { sound } = await Audio.Sound.createAsync(
        require('../assets/sounds/siren.mp3')
      );
      setSound(sound);
      await sound.setIsLoopingAsync(true);
      await sound.playAsync();
      */
      console.log('Siren would play here if siren.mp3 existed');
    } catch (e) {
      console.warn('Could not play siren:', e);
    }
  }

  async function stopSiren() {
    if (sound) {
      await sound.stopAsync();
      await sound.unloadAsync();
      setSound(null);
    }
  }

  const startVibration = () => {
    const PATTERN = [1000, 500, 1000];
    Vibration.vibrate(PATTERN, true);
  };

  const handleStopAlarm = () => {
    if (activeAlert) {
      resolveAlert(activeAlert.id);
      hardwareService.sendCommand({ action: 'stop_alarm' });
    }
  };

  const handleCallEmergency = () => {
    Linking.openURL('tel:911');
  };

  if (!activeAlert) return null;

  return (
    <Modal visible={!!activeAlert} animationType="slide" transparent={false}>
      <View className="flex-1 bg-danger items-center justify-center p-6">
        <View className="w-32 h-32 rounded-full bg-white/20 items-center justify-center mb-8 neon-shadow-red">
          <FontAwesome5 name="exclamation-triangle" size={60} color="white" />
        </View>

        <Text className="text-white text-4xl font-bold mb-2">INTRUSION!</Text>
        <Text className="text-white/80 text-xl mb-8 uppercase tracking-widest">
          {activeAlert.source} SENSOR TRIGGERED
        </Text>

        <View className="bg-black/20 p-6 rounded-2xl w-full mb-8 border border-white/10">
          <Text className="text-white/60 text-center mb-2">Auto-calling emergency contact in</Text>
          <Text className="text-white text-5xl font-bold text-center">{countdown}</Text>
        </View>

        <View className="w-full space-y-4">
          <TouchableOpacity 
            onPress={handleCallEmergency}
            className="bg-white p-5 rounded-2xl items-center flex-row justify-center"
          >
            <FontAwesome5 name="phone-alt" size={20} color="#FF1744" className="mr-3" />
            <Text className="text-danger text-xl font-bold ml-3">CALL POLICE</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={handleStopAlarm}
            className="bg-black/40 border border-white/20 p-5 rounded-2xl items-center mt-4"
          >
            <Text className="text-white text-lg font-bold">DISMISS ALARM</Text>
          </TouchableOpacity>
        </View>

        <View className="absolute bottom-10">
          <Text className="text-white/40 text-xs">SECURITY SYSTEM ENFORCED</Text>
        </View>
      </View>
    </Modal>
  );
};
