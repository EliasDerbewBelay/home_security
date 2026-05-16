import React, { useState, useRef } from 'react';
import { View, Text, PanResponder, StyleSheet } from 'react-native';

interface CyberSliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  unit: string;
  onChange: (value: number) => void;
}

export const CyberSlider = ({ label, value, min, max, unit, onChange }: CyberSliderProps) => {
  const [containerWidth, setContainerWidth] = useState(0);
  
  const percentage = ((value - min) / (max - min)) * 100;

  const handleTouch = (evt: any) => {
    if (containerWidth === 0) return;
    const touchX = Math.max(0, Math.min(evt.nativeEvent.locationX, containerWidth));
    const newValue = min + (touchX / containerWidth) * (max - min);
    onChange(Math.round(newValue * 100) / 100);
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => handleTouch(evt),
      onPanResponderMove: (evt) => handleTouch(evt),
    })
  ).current;

  return (
    <View className="mb-6">
      <View className="flex-row justify-between items-center mb-3">
        <Text className="text-white/80 font-medium">{label}</Text>
        <Text className="text-secondary font-mono font-bold">{value} {unit}</Text>
      </View>
      
      <View 
        className="h-12 justify-center"
        onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)}
        {...panResponder.panHandlers}
      >
        <View style={styles.track}>
          <View className="h-full bg-white/5 rounded-full overflow-hidden w-full">
            <View 
              style={{ width: `${percentage}%` }}
              className="h-full bg-secondary" 
            />
          </View>
          
          <View 
            style={[
              styles.thumb,
              { left: `${percentage}%` }
            ]}
            className="neon-shadow-green"
          >
            <View className="w-1.5 h-1.5 bg-background rounded-full" />
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  track: {
    height: 6,
    width: '100%',
    justifyContent: 'center',
    position: 'relative',
  },
  thumb: {
    position: 'absolute',
    width: 24,
    height: 24,
    backgroundColor: '#00E676',
    borderRadius: 12,
    marginLeft: -12,
    borderWidth: 4,
    borderColor: '#0F172A',
    alignItems: 'center',
    justifyContent: 'center',
  }
});

