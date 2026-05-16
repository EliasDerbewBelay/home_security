import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { MapUIOverlay } from './MapUIOverlay';

export default function MapProvider() {
  return (
    <View style={styles.container}>
      {/* Blueprint Grid Background */}
      <View style={styles.gridContainer}>
        {/* Horizontal Lines */}
        <View style={StyleSheet.absoluteFillObject}>
          {[...Array(20)].map((_, i) => (
            <View key={`h-${i}`} style={[styles.gridLineH, { top: `${(i * 100) / 20}%` }]} />
          ))}
        </View>
        {/* Vertical Lines */}
        <View style={StyleSheet.absoluteFillObject}>
          {[...Array(20)].map((_, i) => (
            <View key={`v-${i}`} style={[styles.gridLineV, { left: `${(i * 100) / 20}%` }]} />
          ))}
        </View>
        {/* Glowing Radar Rings */}
        <View style={styles.radarContainer}>
          <View style={styles.radarRing} />
          <View style={[styles.radarRing, { width: 400, height: 400, opacity: 0.1 }]} />
          <View style={[styles.radarRing, { width: 600, height: 600, opacity: 0.05 }]} />
        </View>
      </View>

      {/* Mock Map Marker - Centered */}
      <View style={styles.markerContainer}>
        <View className="items-center">
          <View className="w-14 h-14 bg-secondary/20 rounded-full items-center justify-center border-2 border-secondary neon-shadow-green">
            <FontAwesome5 name="home" size={24} color="#00E676" />
          </View>
          <View className="bg-background/90 px-3 py-1 rounded-lg mt-2 border border-white/10 shadow-lg">
            <Text className="text-secondary text-[10px] font-bold tracking-[2px]">HOME HUB</Text>
          </View>
        </View>
      </View>

      {/* The UI Overlays */}
      <MapUIOverlay />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#020617',
    position: 'relative',
    overflow: 'hidden',
  },
  gridContainer: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.3,
    transform: [
      { perspective: 1200 }, 
      { rotateX: '60deg' }, 
      { rotateZ: '-10deg' }, 
      { scale: 1.8 }
    ],
  },
  gridLineH: {
    height: 1,
    width: '100%',
    backgroundColor: '#00E5FF',
    opacity: 0.1,
    position: 'absolute',
  },
  gridLineV: {
    width: 1,
    height: '100%',
    backgroundColor: '#00E5FF',
    opacity: 0.1,
    position: 'absolute',
  },
  radarContainer: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radarRing: {
    width: 200,
    height: 200,
    borderRadius: 1000,
    borderWidth: 1,
    borderColor: '#00E5FF',
    opacity: 0.2,
    position: 'absolute',
  },
  markerContainer: {
    position: 'absolute',
    left: '50%',
    top: '50%',
    marginLeft: -60, // Half of 120
    marginTop: -60, // Half of 120
    width: 120,
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 50,
    overflow: 'visible',
  }
});



