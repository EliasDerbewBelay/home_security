import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Share, Linking, Alert } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';

interface MapUIOverlayProps {
  location: { latitude: number; longitude: number } | null;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onSearch: (coords: { latitude: number; longitude: number }) => void;
}

export const MapUIOverlay = ({ location, onZoomIn, onZoomOut, onSearch }: MapUIOverlayProps) => {
  const [searchText, setSearchText] = useState('');

  const activeLat = location?.latitude || 37.78825;
  const activeLng = location?.longitude || -122.4324;

  const handleSearchSubmit = () => {
    if (!searchText.trim()) return;
    
    // Parse custom coordinate search like: "37.7749, -122.4194"
    const parts = searchText.split(',').map(p => parseFloat(p.trim()));
    if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
      onSearch({ latitude: parts[0], longitude: parts[1] });
      Alert.alert("Location Found", `Centering map on coordinates: ${parts[0]}, ${parts[1]}`);
    } else {
      Alert.alert(
        "Search Status",
        `Coordinates parsed incorrectly. Please search in "lat, lng" format (e.g. 37.7749, -122.4194).`,
        [{ text: "OK" }]
      );
    }
  };

  const handleVoiceSearch = () => {
    Alert.alert("Voice Search", "Microphone listening... (Voice Recognition Mocked)");
  };

  const handleDirections = () => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${activeLat},${activeLng}`;
    Linking.canOpenURL(url).then(supported => {
      if (supported) {
        Linking.openURL(url);
      } else {
        Alert.alert("Error", "Unable to launch external maps application.");
      }
    });
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Active secure perimeter location: https://maps.google.com/?q=${activeLat},${activeLng}`,
        title: 'Share Secure Perimeter'
      });
    } catch (error: any) {
      console.error(error);
    }
  };

  return (
    <View style={StyleSheet.absoluteFillObject} pointerEvents="box-none">
      {/* Top Search Bar */}
      <View style={styles.topContainer}>
        <View className="flex-row items-center bg-background/90 border border-white/10 rounded-full px-4 h-14 shadow-2xl">
          <FontAwesome5 name="search" size={16} color="rgba(255,255,255,0.4)" />
          <TextInput 
            placeholder="Search 'lat, lng' (e.g. 37.7, -122.4)" 
            placeholderTextColor="rgba(255,255,255,0.3)"
            className="flex-1 ml-3 text-white font-medium"
            value={searchText}
            onChangeText={setSearchText}
            onSubmitEditing={handleSearchSubmit}
            returnKeyType="search"
          />
          <TouchableOpacity onPress={handleVoiceSearch} className="p-2">
            <FontAwesome5 name="microphone" size={18} color="#00E676" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Zoom Controls */}
      <View style={styles.rightContainer}>
        <TouchableOpacity 
          onPress={onZoomIn}
          className="w-12 h-12 bg-background/90 border border-white/10 rounded-2xl items-center justify-center mb-3 shadow-md active:bg-white/20"
        >
          <FontAwesome5 name="plus" size={16} color="white" />
        </TouchableOpacity>
        <TouchableOpacity 
          onPress={onZoomOut}
          className="w-12 h-12 bg-background/90 border border-white/10 rounded-2xl items-center justify-center shadow-md active:bg-white/20"
        >
          <FontAwesome5 name="minus" size={16} color="white" />
        </TouchableOpacity>
      </View>

      {/* Bottom Card */}
      <View style={styles.bottomContainer}>
        <View style={styles.sheetContainer} className="p-6 rounded-t-[40px] border-t border-white/10 shadow-2xl">
          {/* Handle */}
          <View className="w-12 h-1.5 bg-white/20 rounded-full mx-auto mb-8" />
          
          <View className="flex-row justify-between items-start mb-2">
            <View className="flex-1 mr-4">
              <Text className="text-white text-2xl font-bold">Home Hub Perimeter</Text>
              <View className="flex-row items-center mt-1">
                <FontAwesome5 name="map-marker-alt" size={12} color="rgba(255,255,255,0.6)" />
                <Text className="text-white/60 text-sm ml-2">Primary Secure Zone • GPS Locked</Text>
              </View>
            </View>
            <TouchableOpacity 
              onPress={handleDirections}
              className="w-11 h-11 bg-primary/20 rounded-xl items-center justify-center border border-primary/30 active:bg-primary/40"
            >
              <FontAwesome5 name="directions" size={20} color="#00E676" />
            </TouchableOpacity>
          </View>

          {/* Last Alert Box */}
          <View className="bg-black/40 p-5 rounded-3xl border border-white/5 my-8 flex-row items-center">
            <View className="w-12 h-12 bg-white/5 rounded-full items-center justify-center mr-4">
               <FontAwesome5 name="history" size={18} color="rgba(255,255,255,0.4)" />
            </View>
            <View>
              <Text className="text-white/40 text-[10px] font-bold tracking-[2px] uppercase mb-1">Active Coordinates</Text>
              <Text className="text-[#FF8A80] font-mono text-lg">{activeLat.toFixed(6)}° N, {activeLng.toFixed(6)}° W</Text>
            </View>
          </View>

          {/* Share Button - with bottom padding to clear Tab Bar */}
          <View style={{ paddingBottom: 100 }}>
            <TouchableOpacity 
              onPress={handleShare}
              className="bg-secondary h-16 rounded-3xl flex-row items-center justify-center neon-shadow-green active:opacity-80"
            >
              <FontAwesome5 name="share-alt" size={20} color="#0F172A" />
              <Text className="text-background font-bold text-lg ml-3">Share Location</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  topContainer: {
    position: 'absolute',
    top: 60,
    left: 20,
    right: 20,
    zIndex: 100,
  },
  rightContainer: {
    position: 'absolute',
    right: 20,
    bottom: 450,
    zIndex: 100,
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  sheetContainer: {
    backgroundColor: 'rgba(15, 23, 42, 0.98)',
  }
});
