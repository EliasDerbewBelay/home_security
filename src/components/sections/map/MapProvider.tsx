import React, { useMemo, useRef, useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import MapView, { Marker, Circle } from 'react-native-maps';
import { useEmergencyStore } from '@/store/emergencyStore';
import { MapUIOverlay } from './MapUIOverlay';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import { useCurrentLocation } from '@/hooks/useCurrentLocation';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming } from 'react-native-reanimated';

const FALLBACK_COORD = {
  latitude: 37.78825,
  longitude: -122.4324,
};

export default function MapProvider() {
  const { activeAlert } = useEmergencyStore();
  const { location, loading, errorMsg } = useCurrentLocation();
  const [searchedLocation, setSearchedLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const mapRef = useRef<MapView>(null);

  const scale = useSharedValue(1);

  // Initialize pulsing animation for live marker feel (scale 1.0 -> 1.3 -> 1.0, 2000ms loop)
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

  const camera = useMemo(() => ({
    center: mapCenter,
    pitch: 60, // Dramatic 3D Perspective
    heading: 0,
    altitude: 1000,
    zoom: 17,
  }), [mapCenter]);

  // Animate map camera whenever the active center updates
  useEffect(() => {
    if (mapRef.current && mapCenter) {
      mapRef.current.animateCamera({
        center: mapCenter,
        zoom: 17,
      }, { duration: 1000 });
    }
  }, [mapCenter]);

  const handleZoomIn = () => {
    if (mapRef.current) {
      mapRef.current.getCamera().then((cam) => {
        mapRef.current?.animateCamera({
          zoom: (cam.zoom || 17) + 1,
        }, { duration: 300 });
      });
    }
  };

  const handleZoomOut = () => {
    if (mapRef.current) {
      mapRef.current.getCamera().then((cam) => {
        mapRef.current?.animateCamera({
          zoom: Math.max(1, (cam.zoom || 17) - 1),
        }, { duration: 300 });
      });
    }
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
      {errorMsg && (
        <View className="absolute top-12 left-4 right-4 bg-danger/20 border border-danger/50 p-3 rounded-xl z-50 flex-row items-center">
          <FontAwesome5 name="exclamation-triangle" size={16} color="#EF4444" />
          <Text className="text-danger ml-3 text-xs font-bold">{errorMsg}</Text>
        </View>
      )}

      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFillObject}
        initialCamera={camera}
        userInterfaceStyle="dark"
        customMapStyle={darkMapStyle}
        provider="google"
        showsBuildings={true}
        showsUserLocation={true}
        showsMyLocationButton={true}
      >
        <Marker 
          coordinate={mapCenter}
          anchor={{ x: 0.5, y: 0.5 }}
          tracksViewChanges={true}
        >
          <View style={{ width: 60, height: 60, alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
            {/* Outer Circle: 48x48, 20% opacity accent green, breathing animation */}
            <Animated.View 
              style={[
                {
                  width: 48,
                  height: 48,
                  borderRadius: 24,
                  backgroundColor: 'rgba(0, 230, 118, 0.2)', // 20% opacity accent green (#00E676)
                  position: 'absolute',
                },
                pulsingStyle
              ]}
            />
            {/* Inner Circle: 32x32, solid accent green with drop shadow */}
            <View 
              style={{
                width: 32,
                height: 32,
                borderRadius: 16,
                backgroundColor: '#00E676', // Solid Accent green
                alignItems: 'center',
                justifyContent: 'center',
                elevation: 4, // Android drop shadow
                shadowColor: '#000', // iOS drop shadow
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.25,
                shadowRadius: 3.84,
                zIndex: 10,
              }}
            >
              <Ionicons name="home" size={18} color="white" />
            </View>
          </View>
        </Marker>

        {activeAlert && (
          <Circle
            center={mapCenter}
            radius={200}
            fillColor="rgba(255, 23, 68, 0.2)"
            strokeColor="#FF1744"
          />
        )}
      </MapView>
      
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
