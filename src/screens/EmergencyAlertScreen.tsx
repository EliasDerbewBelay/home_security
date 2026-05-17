import React, { useEffect, useState, useRef } from 'react';
import { View, Text, TouchableOpacity, Modal, Vibration, ScrollView } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { useEmergencyStore } from '@/store/emergencyStore';
import { useSettingsStore } from '@/store/settingsStore';
import { Audio } from 'expo-av';
import * as Linking from 'expo-linking';
import { hardwareService } from '@/services/hardware/hardwareService';
import { doc, onSnapshot, getFirestore } from 'firebase/firestore';
import { auth, db as configDb } from '@/config/firebaseConfig';

const db = configDb || getFirestore();

export const EmergencyAlertScreen = () => {
  const { activeAlert, resolveAlert } = useEmergencyStore();
  const soundRef = useRef<Audio.Sound | null>(null);
  const isDismissedRef = useRef<boolean>(false);
  const [countdown, setCountdown] = useState(15);
  
  const [parentContacts, setParentContacts] = useState<any[]>([]);
  const [policeContacts, setPoliceContacts] = useState<any[]>([]);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user || !activeAlert) return;

    const docRef = doc(db, 'users', user.uid);
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        const sanitize = (list: any[]) => {
          if (!Array.isArray(list)) return [];
          return list.map(item => typeof item === 'string' ? { name: '', phone: item } : { name: item?.name || '', phone: item?.phone || '' });
        };
        setParentContacts(sanitize(data.parentContacts));
        setPoliceContacts(sanitize(data.policeContacts));
      }
    }, (err) => {
      console.error('Alert Screen Contacts onSnapshot Error:', err);
    });

    return unsubscribe;
  }, [activeAlert]);

  const handleAutoCall = () => {
    const emergencyContacts = [
      ...policeContacts,
      ...parentContacts
    ];
    if (emergencyContacts.length > 0) {
      Linking.openURL(`tel:${emergencyContacts[0].phone}`);
    } else {
      Linking.openURL('tel:911');
    }
  };

  // 1. Hardware Trigger Effect: Runs EXACTLY once per activeAlert cycle
  useEffect(() => {
    if (activeAlert) {
      isDismissedRef.current = false;
      playSiren();
      startVibration();
      return () => {
        stopSiren();
        Vibration.cancel();
      };
    }
  }, [!!activeAlert]);

  // 2. Countdown Progression Effect: Runs for visual auto-calling timer updates
  useEffect(() => {
    if (activeAlert) {
      setCountdown(15);
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            handleAutoCall();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => {
        clearInterval(timer);
      };
    }
  }, [activeAlert, policeContacts, parentContacts]);

  async function playSiren() {
    try {
      // Avoid sound duplicates
      if (soundRef.current) {
        try {
          await soundRef.current.unloadAsync();
        } catch (_) {}
      }

      console.log('Intrusion Warning: Overriding silent switch & loading alarm siren...');
      
      // Force audio to play even if device is set to silent or vibrate-only mode
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
        playThroughEarpieceAndroid: false,
      });

      if (isDismissedRef.current) {
        console.log('Already dismissed before loading started, skipping siren play.');
        return;
      }

      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: 'https://www.orangefreesounds.com/wp-content/uploads/2019/06/Warning-alarm-tone.mp3' },
        { shouldPlay: true, isLooping: true, volume: 1.0 }
      );

      // Check if dismissed while the network sound was downloading!
      if (isDismissedRef.current) {
        console.log('Dismissed during load, unloading siren...');
        try {
          await newSound.stopAsync();
          await newSound.unloadAsync();
        } catch (_) {}
        return;
      }

      soundRef.current = newSound;
    } catch (e) {
      console.warn('Could not initialize audio siren broadcast:', e);
    }
  }

  async function stopSiren() {
    isDismissedRef.current = true;
    if (soundRef.current) {
      try {
        await soundRef.current.stopAsync();
        await soundRef.current.unloadAsync();
      } catch (err) {
        console.warn('Siren already unloaded or inactive:', err);
      }
      soundRef.current = null;
    }
  }

  const startVibration = () => {
    const PATTERN = [1000, 500, 1000];
    Vibration.vibrate(PATTERN, true);
  };

  const handleStopAlarm = () => {
    if (activeAlert) {
      stopSiren();
      resolveAlert(activeAlert.id);
      hardwareService.sendCommand({ action: 'stop_alarm' });
    }
  };

  const handleCallContact = (phone: string) => {
    stopSiren();
    Vibration.cancel();
    Linking.openURL(`tel:${phone}`);
  };

  const handleCallEmergency = () => {
    handleCallContact('911');
  };

  const emergencyContacts = [
    ...policeContacts.map(c => ({ ...c, type: 'POLICE' })),
    ...parentContacts.map(c => ({ ...c, type: 'PERSONAL' }))
  ];

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
          <Text className="text-white/60 text-center mb-2">Auto-calling primary responder in</Text>
          <Text className="text-white text-5xl font-bold text-center">{countdown}</Text>
        </View>

        {emergencyContacts.length > 0 ? (
          <View className="w-full mb-6">
            <Text className="text-white/60 text-xs font-bold tracking-[2px] uppercase mb-3 text-center">
              Secured Emergency Contacts
            </Text>
            <ScrollView style={{ maxHeight: 180, width: '100%' }} showsVerticalScrollIndicator={false}>
              {emergencyContacts.map((contact, idx) => (
                <TouchableOpacity 
                  key={`${contact.phone}-${idx}`}
                  onPress={() => handleCallContact(contact.phone)}
                  className="bg-white/10 border border-white/20 p-4 rounded-2xl flex-row items-center justify-between mb-3 w-full active:bg-white/20"
                >
                  <View className="flex-row items-center">
                    <View className={`w-10 h-10 rounded-full items-center justify-center mr-4 border ${
                      contact.type === 'POLICE' ? 'bg-[#FF1744]/20 border-[#FF1744]/40' : 'bg-[#00E5FF]/20 border-[#00E5FF]/40'
                    }`}>
                      <FontAwesome5 
                        name={contact.type === 'POLICE' ? 'shield-alt' : 'user'} 
                        size={14} 
                        color={contact.type === 'POLICE' ? '#FF1744' : '#00E5FF'} 
                      />
                    </View>
                    <View>
                      <Text className="text-white font-bold text-base">{contact.name || 'Emergency Dispatch'}</Text>
                      <Text className="text-white/60 font-mono text-xs mt-0.5">{contact.phone}</Text>
                    </View>
                  </View>
                  <View className="w-9 h-9 rounded-full bg-[#00E676]/10 items-center justify-center border border-[#00E676]/20">
                    <FontAwesome5 name="phone-alt" size={12} color="#00E676" />
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        ) : (
          <View className="w-full mb-6">
            <TouchableOpacity 
              onPress={handleCallEmergency}
              className="bg-white p-5 rounded-2xl items-center flex-row justify-center w-full shadow-2xl"
            >
              <FontAwesome5 name="phone-alt" size={20} color="#FF1744" />
              <Text className="text-danger text-xl font-bold ml-3">CALL POLICE</Text>
            </TouchableOpacity>
          </View>
        )}

        <TouchableOpacity 
          onPress={handleStopAlarm}
          className="bg-black/40 border border-white/20 p-5 rounded-2xl items-center w-full"
        >
          <Text className="text-white text-lg font-bold">DISMISS ALARM</Text>
        </TouchableOpacity>

        <View className="absolute bottom-10">
          <Text className="text-white/40 text-xs">SECURITY SYSTEM ENFORCED</Text>
        </View>
      </View>
    </Modal>
  );
};
