import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import Animated, { 
  useAnimatedStyle, 
  withSpring, 
  withTiming, 
  useSharedValue, 
  interpolate,
  withDelay,
  Easing
} from 'react-native-reanimated';
import { useDeviceStore } from '@/store/deviceStore';
import { hardwareService } from '@/services/hardware/hardwareService';

export const SecurityFloatingMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { setArmed } = useDeviceStore();
  const animation = useSharedValue(0);

  const toggleMenu = () => {
    const nextValue = isOpen ? 0 : 1;
    animation.value = withTiming(nextValue, { 
      duration: 300, 
      easing: Easing.out(Easing.exp) 
    });
    setIsOpen(!isOpen);
  };

  const handleAction = (action: string) => {
    if (action === 'arm') setArmed(true);
    if (action === 'disarm') setArmed(false);
    
    hardwareService.sendCommand({ action });
    toggleMenu();
  };

  const fabStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${animation.value * 45}deg` }],
  }));

  const menuItems = [
    { label: 'Arm', icon: 'lock', color: '#00E676', action: 'arm' },
    { label: 'Disarm', icon: 'lock-open', color: '#94A3B8', action: 'disarm' },
    { label: 'Test Alarm', icon: 'bell', color: '#00E5FF', action: 'trigger_siren' },
    { label: 'Emergency', icon: 'phone-alt', color: '#FF1744', action: 'panic' },
  ];

  return (
    <View style={styles.container}>
      {/* Menu Items */}
      {menuItems.map((item, index) => {
        const itemAnimation = useAnimatedStyle(() => {
          // Snappier, shorter vertical distance
          const translateY = interpolate(animation.value, [0, 1], [0, -62 * (index + 1)]);
          const opacity = interpolate(animation.value, [0, 1], [0, 1]);
          const scale = interpolate(animation.value, [0, 1], [0.9, 1]);
          
          return {
            opacity,
            transform: [{ translateY }, { scale }],
          };
        });

        return (
          <Animated.View key={item.label} style={[styles.itemContainer, itemAnimation]}>
            <TouchableOpacity 
              onPress={() => handleAction(item.action)}
              style={[styles.item, { backgroundColor: item.color }]}
              className="shadow-xl"
            >
              <FontAwesome5 name={item.icon} size={16} color="#0F172A" />
              <Text className="text-background font-bold ml-3 text-xs">{item.label}</Text>
            </TouchableOpacity>
          </Animated.View>
        );
      })}

      {/* Main FAB */}
      <TouchableOpacity 
        onPress={toggleMenu}
        activeOpacity={0.8}
      >
        <Animated.View 
          style={[styles.fab, fabStyle]}
          className="bg-secondary shadow-2xl neon-shadow-green"
        >
          <FontAwesome5 name={isOpen ? 'plus' : 'shield-alt'} size={24} color="#0F172A" />
        </Animated.View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 110, // Adjusted to sit above the tab bar
    right: 25,
    alignItems: 'center',
    zIndex: 1000,
  },
  fab: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemContainer: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    alignItems: 'flex-end',
    width: 150,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    minWidth: 120,
  }
});
