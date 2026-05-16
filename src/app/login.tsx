import React from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { GlassCard } from '@/components/ui/GlassCard';
import { useAuthStore } from '@/store/authStore';
import { router } from 'expo-router';
import { FontAwesome5 } from '@expo/vector-icons';

export default function LoginScreen() {
  const { setAuth } = useAuthStore();
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');

  const handleLogin = () => {
    // Mock login
    setAuth('mock-token', { id: '1', email, name: 'Admin User' });
    router.replace('/(tabs)');
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-background justify-center p-6"
    >
      <View className="items-center mb-10">
        <View className="w-20 h-20 bg-primary/20 rounded-3xl items-center justify-center mb-4 neon-shadow-blue">
          <FontAwesome5 name="user-shield" size={32} color="#00E5FF" />
        </View>
        <Text className="text-white text-3xl font-bold">Secure Access</Text>
        <Text className="text-white/40 mt-1">Enter your credentials to continue</Text>
      </View>

      <GlassCard className="p-6">
        <View className="mb-4">
          <Text className="text-white/60 text-xs mb-2">EMAIL ADDRESS</Text>
          <View className="bg-black/20 rounded-xl p-4 border border-white/5">
            <TextInput 
              placeholder="admin@secure.home"
              placeholderTextColor="rgba(255,255,255,0.2)"
              className="text-white"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
            />
          </View>
        </View>

        <View className="mb-8">
          <Text className="text-white/60 text-xs mb-2">PASSWORD</Text>
          <View className="bg-black/20 rounded-xl p-4 border border-white/5">
            <TextInput 
              placeholder="••••••••"
              placeholderTextColor="rgba(255,255,255,0.2)"
              className="text-white"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>
        </View>

        <TouchableOpacity 
          onPress={handleLogin}
          className="bg-primary p-4 rounded-xl items-center"
        >
          <Text className="text-background font-bold text-lg">AUTHENTICATE</Text>
        </TouchableOpacity>

        <TouchableOpacity className="mt-4 items-center">
          <Text className="text-white/40 text-xs">Forgot Security Key?</Text>
        </TouchableOpacity>
      </GlassCard>

      <View className="flex-row justify-center mt-8">
        <Text className="text-white/40">Don't have an account? </Text>
        <TouchableOpacity onPress={() => router.push('/register')}>
          <Text className="text-primary font-bold">Register</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}
