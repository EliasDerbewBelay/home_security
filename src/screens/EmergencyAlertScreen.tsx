import React, { useEffect, useRef } from 'react';
import { View, Text, Modal, Vibration } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { useSensorStore } from '@/store/sensorStore';
import { Audio } from 'expo-av';

export const EmergencyAlertScreen = () => {
  const { distance, buzzerActive } = useSensorStore();
  const soundRef = useRef<Audio.Sound | null>(null);

  useEffect(() => {
    if (buzzerActive) {
      playSiren();
      startVibration();
    } else {
      stopSiren();
      Vibration.cancel();
    }

    return () => {
      stopSiren();
      Vibration.cancel();
    };
  }, [buzzerActive]);

  async function playSiren() {
    try {
      if (soundRef.current) return;
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
        playThroughEarpieceAndroid: false,
      });

      const { sound } = await Audio.Sound.createAsync(
        { uri: 'https://www.orangefreesounds.com/wp-content/uploads/2019/06/Warning-alarm-tone.mp3' },
        { shouldPlay: true, isLooping: true, volume: 1.0 }
      );
      soundRef.current = sound;
    } catch (e) {
      console.warn('Could not initialize audio siren:', e);
    }
  }

  async function stopSiren() {
    if (soundRef.current) {
      try {
        await soundRef.current.stopAsync();
        await soundRef.current.unloadAsync();
      } catch (err) {}
      soundRef.current = null;
    }
  }

  const startVibration = () => {
    const PATTERN = [1000, 500, 1000];
    Vibration.vibrate(PATTERN, true);
  };

  if (!buzzerActive) return null;

  return (
    <Modal visible={buzzerActive} animationType="fade" transparent={false}>
      <View className="flex-1 bg-danger items-center justify-center p-6">
        <View className="w-40 h-40 rounded-full bg-white/20 items-center justify-center mb-8 neon-shadow-red">
          <FontAwesome5 name="exclamation-triangle" size={80} color="white" />
        </View>

        <Text className="text-white text-4xl font-bold mb-4 text-center">Intrusion Detected</Text>
        
        <View className="bg-black/30 px-6 py-4 rounded-full border border-white/20 mb-12">
          <Text className="text-white text-xl font-bold uppercase tracking-widest text-center">
            Object detected at {distance !== null ? `${distance.toFixed(1)}cm` : 'Unknown'}
          </Text>
        </View>

        <View className="absolute bottom-12 items-center">
          <FontAwesome5 name="shield-alt" size={24} color="rgba(255,255,255,0.4)" />
          <Text className="text-white/60 text-xs mt-3 uppercase tracking-[3px] font-bold">
            Hardware Enforced Security
          </Text>
          <Text className="text-white/40 text-[10px] mt-1 uppercase tracking-widest">
            (Clears automatically when area is secure)
          </Text>
        </View>
      </View>
    </Modal>
  );
};
