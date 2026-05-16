import React from 'react';
import { FontAwesome5 } from '@expo/vector-icons';
import { Tabs, Redirect } from 'expo-router';
import { View } from 'react-native';
import { useAuthStore } from '@/store/authStore';

export default function TabLayout() {
  const { isAuthenticated } = useAuthStore();
  if (!isAuthenticated) return <Redirect href="/login" />;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: 'rgba(15, 23, 42, 0.95)',
          borderTopWidth: 0,
          position: 'absolute',
          bottom: 20,
          left: 20,
          right: 20,
          borderRadius: 30,
          height: 70,
          paddingBottom: 10,
          paddingTop: 10,
          elevation: 0,
          shadowOpacity: 0,
        },
        tabBarActiveTintColor: '#00E676',
        tabBarInactiveTintColor: 'rgba(255, 255, 255, 0.3)',
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: 'bold',
          marginTop: -5,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color }) => <FontAwesome5 name="th-large" size={20} color={color} />,
        }}
      />
      <Tabs.Screen
        name="sensors"
        options={{
          title: 'Sensors',
          tabBarIcon: ({ color }) => <FontAwesome5 name="broadcast-tower" size={20} color={color} />,
        }}
      />
      <Tabs.Screen
        name="map"
        options={{
          title: 'Map',
          tabBarIcon: ({ color }) => <FontAwesome5 name="map-marked-alt" size={20} color={color} />,
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'History',
          tabBarIcon: ({ color }) => <FontAwesome5 name="history" size={20} color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color }) => <FontAwesome5 name="cog" size={20} color={color} />,
        }}
      />
    </Tabs>
  );
}

