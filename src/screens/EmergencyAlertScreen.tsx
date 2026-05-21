import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Modal, Vibration, TouchableOpacity, Linking, ActivityIndicator, Share } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { useSensorStore } from '@/store/sensorStore';
import { Audio } from 'expo-av';
import { auth, db } from '@/config/firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import { useCurrentLocation } from '@/hooks/useCurrentLocation';

export const EmergencyAlertScreen = () => {
  const { distance, buzzerActive, updateSensor } = useSensorStore();
  const soundRef = useRef<Audio.Sound | null>(null);
  
  const [dbContacts, setDbContacts] = useState<{name: string, phone: string, isPolice: boolean}[]>([]);
  const [loadingContacts, setLoadingContacts] = useState(false);
  
  const { location, loading: locationLoading } = useCurrentLocation();

  useEffect(() => {
    if (buzzerActive) {
      playSiren();
      startVibration();
      
      // Fetch contacts
      if (auth.currentUser) {
        setLoadingContacts(true);
        getDoc(doc(db, 'users', auth.currentUser.uid)).then((docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            const police = (data.policeContacts || []).map((c: any) => ({ 
              name: c.name || 'Police', 
              phone: c.phone || '911', 
              isPolice: true 
            }));
            const personal = (data.parentContacts || []).map((c: any) => ({ 
              name: c.name || 'Contact', 
              phone: c.phone || '', 
              isPolice: false 
            }));
            setDbContacts([...police, ...personal].slice(0, 4));
          } else {
            setDbContacts([]);
          }
        }).catch((e) => {
          console.error('Failed to fetch emergency contacts:', e);
          setDbContacts([]);
        }).finally(() => {
          setLoadingContacts(false);
        });
      }
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

  const handleDismiss = () => {
    updateSensor({ buzzerActive: false });
  };

  const handleShareLocation = async () => {
    if (!location) return;
    const url = `https://maps.google.com/?q=${location.latitude},${location.longitude}`;
    try {
      await Share.share({
        message: `EMERGENCY! I need immediate assistance. This is an automated alert from my home security node. My current device location is: ${url}`,
      });
    } catch (error) {
      console.error(error);
    }
  };

  if (!buzzerActive) return null;

  return (
    <Modal visible={buzzerActive} animationType="fade" transparent={false}>
      <View className="flex-1 bg-danger items-center justify-center p-6">
        <View className="w-40 h-40 rounded-full bg-white/20 items-center justify-center mb-8 neon-shadow-red">
          <FontAwesome5 name="exclamation-triangle" size={80} color="white" />
        </View>

        <Text className="text-white text-4xl font-bold mb-4 text-center">Intrusion Detected</Text>
        
        <View className="bg-black/30 px-6 py-4 rounded-full border border-white/20 mb-8">
          <Text className="text-white text-xl font-bold uppercase tracking-widest text-center">
            Object detected at {distance !== null ? `${distance.toFixed(1)}cm` : 'Unknown'}
          </Text>
        </View>

        <View className="w-full mb-12">
          <Text className="text-white/80 text-xs uppercase tracking-widest font-bold mb-4 text-center">
            Emergency Contacts
          </Text>
          {loadingContacts ? (
             <ActivityIndicator size="small" color="white" />
          ) : (
            <View className="flex-row justify-center flex-wrap gap-y-3">
              {dbContacts.length > 0 ? (
                dbContacts.map((contact, index) => (
                  <TouchableOpacity 
                    key={index}
                    onPress={() => Linking.openURL(`tel:${contact.phone}`)}
                    className="bg-white/10 px-4 py-3 rounded-full border border-white/30 flex-row items-center mx-1 my-1"
                  >
                    <FontAwesome5 name={contact.isPolice ? "shield-alt" : "phone-alt"} size={14} color="white" />
                    <Text className="text-white font-bold ml-2">
                      {contact.name}
                    </Text>
                  </TouchableOpacity>
                ))
              ) : (
                <>
                  <TouchableOpacity 
                    onPress={() => Linking.openURL('tel:911')}
                    className="bg-white/10 px-6 py-3 rounded-full border border-white/30 flex-row items-center mx-2"
                  >
                    <FontAwesome5 name="phone-alt" size={14} color="white" />
                    <Text className="text-white font-bold ml-2">Police (911)</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    onPress={() => Linking.openURL('tel:112')}
                    className="bg-white/10 px-6 py-3 rounded-full border border-white/30 flex-row items-center mx-2"
                  >
                    <FontAwesome5 name="ambulance" size={14} color="white" />
                    <Text className="text-white font-bold ml-2">Medical (112)</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          )}
        </View>

        <View className="absolute bottom-10 w-full px-8">
          <TouchableOpacity 
            onPress={handleShareLocation}
            disabled={locationLoading || !location}
            className={`px-10 py-4 rounded-full border mb-4 flex-row items-center justify-center ${locationLoading || !location ? 'bg-black/20 border-white/10' : 'bg-[#00E5FF]/20 border-[#00E5FF]/50 neon-shadow-blue'}`}
          >
            {locationLoading ? (
               <ActivityIndicator size="small" color="white" />
            ) : (
              <>
                <FontAwesome5 name="map-marker-alt" size={20} color="white" />
                <Text className="text-white font-bold text-lg ml-3 uppercase tracking-wider">
                  Share Location
                </Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={handleDismiss}
            className="bg-black/40 px-10 py-4 rounded-full border border-white/30 flex-row items-center justify-center"
          >
            <FontAwesome5 name="times-circle" size={20} color="white" />
            <Text className="text-white font-bold text-lg ml-3 uppercase tracking-wider">
              Dismiss Alarm
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};
