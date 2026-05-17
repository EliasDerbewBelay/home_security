import React, { useMemo, useRef, useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import MapView, { Marker, Circle } from 'react-native-maps';
import { useEmergencyStore } from '@/store/emergencyStore';
import { MapUIOverlay } from './MapUIOverlay';
import { FontAwesome5 } from '@expo/vector-icons';
import { useCurrentLocation } from '@/hooks/useCurrentLocation';

const FALLBACK_COORD = {
  latitude: 37.78825,
  longitude: -122.4324,
};

export default function MapProvider() {
  const { activeAlert } = useEmergencyStore();
  const { location, loading, errorMsg } = useCurrentLocation();
  const [searchedLocation, setSearchedLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const mapRef = useRef<MapView>(null);

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
