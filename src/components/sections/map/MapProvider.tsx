import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import MapView, { Marker, Circle } from 'react-native-maps';
import { useEmergencyStore } from '@/store/emergencyStore';
import { MapUIOverlay } from './MapUIOverlay';
import { FontAwesome5 } from '@expo/vector-icons';

export default function MapProvider() {
  const { activeAlert } = useEmergencyStore();

  const homeCamera = {
    center: {
      latitude: 37.78825,
      longitude: -122.4324,
    },
    pitch: 60, // Dramatic 3D Perspective
    heading: 0,
    altitude: 1000,
    zoom: 17,
  };

  return (
    <View style={styles.container}>
      <MapView
        style={StyleSheet.absoluteFillObject}
        initialCamera={homeCamera}
        userInterfaceStyle="dark"
        customMapStyle={darkMapStyle}
        provider="google"
        showsBuildings={true}
      >
        <Marker 
          coordinate={homeCamera.center}
          anchor={{ x: 0.5, y: 0.5 }}
          tracksViewChanges={false}
        >
          <View style={{ width: 120, height: 120, alignItems: 'center', justifyContent: 'center', overflow: 'visible' }}>
            <View className="w-14 h-14 bg-secondary/20 rounded-full items-center justify-center border-2 border-secondary neon-shadow-green">
              <FontAwesome5 name="home" size={24} color="#00E676" />
            </View>
            <View className="bg-background/90 px-3 py-1 rounded-lg mt-2 border border-white/10 shadow-lg">
              <Text className="text-secondary text-[10px] font-bold tracking-[2px]">HOME HUB</Text>
            </View>
          </View>
        </Marker>

        {activeAlert && (
          <Circle
            center={homeCamera.center}
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


