import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { GlassCard } from '@/components/ui/GlassCard';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export const MapUIOverlay = () => {
  return (
    <View style={StyleSheet.absoluteFillObject} pointerEvents="box-none">
      {/* Top Search Bar Container */}
      <View style={styles.topContainer}>
        <View className="flex-row items-center bg-background/95 border border-white/10 rounded-full px-4 h-14 shadow-2xl">
          <FontAwesome5 name="search" size={16} color="rgba(255,255,255,0.4)" />
          <TextInput 
            placeholder="Search coordinates or address" 
            placeholderTextColor="rgba(255,255,255,0.3)"
            className="flex-1 ml-3 text-white font-medium"
          />
          <FontAwesome5 name="microphone" size={18} color="#00E676" />
        </View>
      </View>

      {/* Right Zoom Controls Container */}
      <View style={styles.rightContainer}>
        <TouchableOpacity className="w-12 h-12 bg-background/90 border border-white/10 rounded-2xl items-center justify-center mb-3 shadow-md">
          <FontAwesome5 name="plus" size={16} color="white" />
        </TouchableOpacity>
        <TouchableOpacity className="w-12 h-12 bg-background/90 border border-white/10 rounded-2xl items-center justify-center shadow-md">
          <FontAwesome5 name="minus" size={16} color="white" />
        </TouchableOpacity>
      </View>

      {/* Bottom Info Card Container */}
      <View style={styles.bottomContainer}>
        <GlassCard className="p-6 rounded-t-[40px] border-t border-white/10 shadow-2xl">
          <View className="w-12 h-1.5 bg-white/20 rounded-full mx-auto mb-6" />
          
          <View className="flex-row justify-between items-start mb-2">
            <View className="flex-1 mr-4">
              <Text className="text-white text-2xl font-bold">Home — 123 Main St</Text>
              <View className="flex-row items-center mt-1">
                <FontAwesome5 name="map-marker-alt" size={12} color="#00E676" />
                <Text className="text-white/50 text-sm ml-2">Primary Secure Perimeter • Active</Text>
              </View>
            </View>
            <TouchableOpacity className="w-12 h-12 bg-secondary/20 rounded-2xl items-center justify-center border border-secondary/30">
              <FontAwesome5 name="directions" size={22} color="#00E676" />
            </TouchableOpacity>
          </View>

          <View className="bg-white/5 p-4 rounded-2xl border border-white/5 my-6 flex-row items-center">
            <View className="w-12 h-12 bg-primary/10 rounded-full items-center justify-center mr-4">
               <FontAwesome5 name="history" size={18} color="#00E5FF" />
            </View>
            <View>
              <Text className="text-white/40 text-[10px] font-bold tracking-widest uppercase mb-1">Last Alert Location</Text>
              <Text className="text-danger font-mono text-lg">40.7128° N, 74.0060° W</Text>
            </View>
          </View>

          <TouchableOpacity className="bg-secondary h-16 rounded-2xl flex-row items-center justify-center neon-shadow-green mb-4">
            <FontAwesome5 name="share-alt" size={20} color="#0F172A" />
            <Text className="text-background font-bold text-lg ml-3">Share Location</Text>
          </TouchableOpacity>
        </GlassCard>
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
    bottom: 380, // Moved up to clear the bottom card
    zIndex: 100,
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 100,
  }
});
