import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { router } from 'expo-router';
import { GlassCard } from '@/components/ui/GlassCard';

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-[#020617]"
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 24 }}>
        {/* Logo/Icon */}
        <View className="items-center mb-10">
          <View className="w-20 h-20 bg-secondary/10 rounded-3xl items-center justify-center border border-secondary/20 neon-shadow-green">
            <FontAwesome5 name="user-plus" size={32} color="#00E676" />
          </View>
          <Text className="text-white text-3xl font-bold mt-6">Create Account</Text>
          <Text className="text-white/40 mt-2">Initialize your security profile</Text>
        </View>

        <GlassCard className="p-8">
          {/* Full Name */}
          <View className="mb-5">
            <Text className="text-white/40 text-[10px] font-bold tracking-[4px] uppercase mb-3 ml-1">Full Name</Text>
            <View className="flex-row items-center bg-black/40 border border-white/10 rounded-2xl px-5 py-4">
              <FontAwesome5 name="user" size={16} color="rgba(255,255,255,0.2)" />
              <TextInput
                placeholder="Enter your name"
                placeholderTextColor="rgba(255,255,255,0.2)"
                value={name}
                onChangeText={setName}
                className="flex-1 ml-4 text-white font-medium"
              />
            </View>
          </View>

          {/* Email */}
          <View className="mb-5">
            <Text className="text-white/40 text-[10px] font-bold tracking-[4px] uppercase mb-3 ml-1">Secure Email</Text>
            <View className="flex-row items-center bg-black/40 border border-white/10 rounded-2xl px-5 py-4">
              <FontAwesome5 name="envelope" size={16} color="rgba(255,255,255,0.2)" />
              <TextInput
                placeholder="admin@shieldnet.local"
                placeholderTextColor="rgba(255,255,255,0.2)"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                className="flex-1 ml-4 text-white font-medium"
              />
            </View>
          </View>

          {/* Password */}
          <View className="mb-5">
            <Text className="text-white/40 text-[10px] font-bold tracking-[4px] uppercase mb-3 ml-1">Encryption Key</Text>
            <View className="flex-row items-center bg-black/40 border border-white/10 rounded-2xl px-5 py-4">
              <FontAwesome5 name="lock" size={16} color="rgba(255,255,255,0.2)" />
              <TextInput
                placeholder="••••••••••••"
                placeholderTextColor="rgba(255,255,255,0.2)"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                className="flex-1 ml-4 text-white font-medium"
              />
            </View>
          </View>

          {/* Confirm Password */}
          <View className="mb-8">
            <Text className="text-white/40 text-[10px] font-bold tracking-[4px] uppercase mb-3 ml-1">Confirm Key</Text>
            <View className="flex-row items-center bg-black/40 border border-white/10 rounded-2xl px-5 py-4">
              <FontAwesome5 name="shield-alt" size={16} color="rgba(255,255,255,0.2)" />
              <TextInput
                placeholder="••••••••••••"
                placeholderTextColor="rgba(255,255,255,0.2)"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                className="flex-1 ml-4 text-white font-medium"
              />
            </View>
          </View>

          <TouchableOpacity 
            onPress={() => router.replace('/(tabs)')}
            className="bg-secondary py-5 rounded-2xl items-center neon-shadow-green"
          >
            <Text className="text-background font-bold text-lg tracking-[2px] uppercase">Initialize Profile</Text>
          </TouchableOpacity>
        </GlassCard>

        {/* Footer */}
        <TouchableOpacity 
          onPress={() => router.back()}
          className="mt-10 items-center"
        >
          <Text className="text-white/40 font-medium">
            Already registered? <Text className="text-secondary font-bold">Access Terminal</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
