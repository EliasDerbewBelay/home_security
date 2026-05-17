import React, { useMemo, useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import { MapUIOverlay } from './MapUIOverlay';
import { useCurrentLocation } from '@/hooks/useCurrentLocation';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming } from 'react-native-reanimated';

const FALLBACK_COORD = {
  latitude: 37.78825,
  longitude: -122.4324,
};

export default function MapProvider() {
  const { location, loading, errorMsg } = useCurrentLocation();
  const [zoomScale, setZoomScale] = useState(1.8);
  const [searchedLocation, setSearchedLocation] = useState<{ latitude: number; longitude: number } | null>(null);

  const scale = useSharedValue(1);

  // Match the identical 2000ms infinite pulsing animation on web
  useEffect(() => {
    scale.value = withRepeat(
      withTiming(1.3, { duration: 1000 }),
      -1,
      true
    );
  }, []);

  const pulsingStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  const mapCenter = useMemo(() => {
    if (searchedLocation) return searchedLocation;
    if (location) return location;
    return FALLBACK_COORD;
  }, [searchedLocation, location]);

  const handleZoomIn = () => {
    setZoomScale(prev => Math.min(3.5, prev + 0.25));
  };

  const handleZoomOut = () => {
    setZoomScale(prev => Math.max(0.6, prev - 0.25));
  };

  const handleSearch = (coords: { latitude: number; longitude: number }) => {
    setSearchedLocation(coords);
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <View className="w-20 h-20 bg-primary/10 rounded-full items-center justify-center border border-primary/30 neon-shadow-blue mb-4">
          <FontAwesome5 name="satellite-dish" size={32} color="#00E5FF" />
        </View>
        <ActivityIndicator size="large" color="#00E5FF" />
        <Text className="text-white/60 mt-4 text-xs tracking-widest uppercase font-bold">Acquiring GPS Signal...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Blueprint Grid Background */}
      <View style={[styles.gridContainer, {
        transform: [
          { perspective: 1200 }, 
          { rotateX: '60deg' }, 
          { rotateZ: '-10deg' }, 
          { scale: zoomScale }
        ]
      }]}>
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

      {errorMsg && (
        <View className="absolute top-12 left-4 right-4 bg-danger/20 border border-danger/50 p-3 rounded-xl z-50 flex-row items-center">
          <FontAwesome5 name="exclamation-triangle" size={16} color="#EF4444" />
          <Text className="text-danger ml-3 text-xs font-bold">{errorMsg}</Text>
        </View>
      )}

      {/* Mock Map Marker - Centered */}
      <View style={styles.markerContainer}>
        <View className="items-center justify-center position-relative" style={{ width: 120, height: 120 }}>
          {/* Outer Pulsing Circle */}
          <Animated.View 
            style={[
              {
                width: 48,
                height: 48,
                borderRadius: 24,
                backgroundColor: 'rgba(0, 230, 118, 0.2)', // 20% opacity accent green
                position: 'absolute',
              },
              pulsingStyle
            ]}
          />
          {/* Inner Circle with Ionicons Home Icon */}
          <View 
            style={{
              width: 32,
              height: 32,
              borderRadius: 16,
              backgroundColor: '#00E676',
              alignItems: 'center',
              justifyContent: 'center',
              elevation: 4,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.25,
              shadowRadius: 3.84,
              zIndex: 10,
            }}
          >
            <Ionicons name="home" size={18} color="white" />
          </View>
          {mapCenter && (
            <View className="bg-primary/20 px-3 py-1 rounded-lg mt-6 border border-primary/30 shadow-lg z-20">
              <Text className="text-primary text-[8px] font-bold tracking-widest">
                {mapCenter.latitude.toFixed(4)}, {mapCenter.longitude.toFixed(4)}
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* The UI Overlays */}
      <MapUIOverlay 
        location={mapCenter}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onSearch={handleSearch}
      />
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
    marginLeft: -60,
    marginTop: -60,
    width: 120,
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 50,
    overflow: 'visible',
  }
});

