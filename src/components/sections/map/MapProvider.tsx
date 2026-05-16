import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import MapView, { Marker, Circle } from 'react-native-maps';
import { useEmergencyStore } from '@/store/emergencyStore';
import { MapUIOverlay } from './MapUIOverlay';
import { FontAwesome5 } from '@expo/vector-icons';

export default function MapProvider() {
  const { activeAlert } = useEmergencyStore();

  const homeLocation = {
    latitude: 37.78825,
    longitude: -122.4324,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  };

  return (
    <View style={styles.container}>
      <MapView
        style={StyleSheet.absoluteFillObject}
        initialRegion={homeLocation}
        userInterfaceStyle="dark"
        customMapStyle={darkMapStyle}
        provider="google"
      >
        <Marker coordinate={homeLocation}>
          <View className="items-center">
            <View className="w-12 h-12 bg-secondary/20 rounded-full items-center justify-center border-2 border-secondary neon-shadow-green">
              <FontAwesome5 name="home" size={20} color="#00E676" />
            </View>
            <View className="bg-background/80 px-2 py-0.5 rounded-md mt-1 border border-white/10">
              <Text className="text-secondary text-[8px] font-bold tracking-widest">HOME</Text>
            </View>
          </View>
        </Marker>

        {activeAlert && (
          <Circle
            center={homeLocation}
            radius={200}
            fillColor="rgba(255, 23, 68, 0.2)"
            strokeColor="#FF1744"
          />
        )}
      </MapView>
      
      <MapUIOverlay />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  }
});

const darkMapStyle = [
  {
    "elementType": "geometry",
    "stylers": [{"color": "#0F172A"}]
  },
  {
    "elementType": "labels.text.fill",
    "stylers": [{"color": "#4B5563"}]
  },
  {
    "featureType": "road",
    "elementType": "geometry",
    "stylers": [{"color": "#1E293B"}]
  },
  {
    "featureType": "water",
    "elementType": "geometry",
    "stylers": [{"color": "#020617"}]
  }
];


