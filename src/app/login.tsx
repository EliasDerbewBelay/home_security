import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import { GlassCard } from '@/components/ui/GlassCard';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function LoginScreen() {
  const { login, register, isLoading } = useAuthStore();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const insets = useSafeAreaInsets();

  const handleLogin = async () => {
    setError(null);
    if (!email || !password) {
      setError('Please enter your email and password.');
      return;
    }

    const { error: authError } = await login(email, password);
    if (authError) {
      setError(authError);
    } else {
      router.replace('/(tabs)');
    }
  };

  const handleRegister = async () => {
    setError(null);
    if (!fullName || !email || !password) {
      setError('All fields are required.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    const { error: authError } = await register(fullName, email, password);
    if (authError) {
      setError(authError);
    } else {
      router.replace('/(tabs)');
    }
  };

  const fillDemoCredentials = () => {
    setEmail('admin@shieldnet.local');
    setPassword('Admin1234');
    setError(null);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-background"
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <ScrollView
        className="flex-1 bg-background"
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Background content */}
        <View 
          className="flex-1 px-6 pt-20"
          style={{ paddingBottom: Math.max(insets.bottom, 40) }}
        >
          {/* Logo / Branding */}
          <View className="items-center mb-12">
            <View className="w-24 h-24 rounded-full bg-primary/10 border border-primary/30 items-center justify-center mb-6 neon-shadow-blue">
              <FontAwesome5 name="shield-alt" size={40} color="#00E5FF" />
            </View>
            <Text className="text-white text-4xl font-bold tracking-tight">ShieldNet</Text>
            <Text className="text-white/40 text-sm font-bold tracking-[4px] uppercase mt-1">
              Security Command
            </Text>
          </View>

          {/* Mode Switcher */}
          <View className="flex-row bg-white/5 p-1 rounded-2xl border border-white/10 mb-8">
            <TouchableOpacity
              onPress={() => { setMode('login'); setError(null); }}
              className={`flex-1 py-3 rounded-xl items-center ${mode === 'login' ? 'bg-primary/20 border border-primary/40' : ''}`}
            >
              <Text className={`font-bold text-sm ${mode === 'login' ? 'text-primary' : 'text-white/30'}`}>
                Sign In
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => { setMode('register'); setError(null); }}
              className={`flex-1 py-3 rounded-xl items-center ${mode === 'register' ? 'bg-secondary/20 border border-secondary/40' : ''}`}
            >
              <Text className={`font-bold text-sm ${mode === 'register' ? 'text-secondary' : 'text-white/30'}`}>
                Register
              </Text>
            </TouchableOpacity>
          </View>

          {/* Form */}
          <GlassCard className="p-6">
            {mode === 'register' && (
              <View className="mb-5">
                <Text className="text-white/40 text-xs font-bold uppercase tracking-widest mb-2">
                  Full Name
                </Text>
                <TextInput
                  value={fullName}
                  onChangeText={setFullName}
                  placeholder="John Doe"
                  placeholderTextColor="rgba(255,255,255,0.2)"
                  autoCapitalize="words"
                  className="bg-black/40 border border-white/10 rounded-2xl p-4 text-white"
                />
              </View>
            )}

            <View className="mb-5">
              <Text className="text-white/40 text-xs font-bold uppercase tracking-widest mb-2">
                Email
              </Text>
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="admin@shieldnet.local"
                placeholderTextColor="rgba(255,255,255,0.2)"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                className="bg-black/40 border border-white/10 rounded-2xl p-4 text-white"
              />
            </View>

            <View className="mb-5">
              <Text className="text-white/40 text-xs font-bold uppercase tracking-widest mb-2">
                Password
              </Text>
              <View className="relative">
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  placeholder="••••••••"
                  placeholderTextColor="rgba(255,255,255,0.2)"
                  secureTextEntry={!showPassword}
                  className="bg-black/40 border border-white/10 rounded-2xl p-4 text-white pr-14"
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-4"
                >
                  <FontAwesome5
                    name={showPassword ? 'eye-slash' : 'eye'}
                    size={16}
                    color="rgba(255,255,255,0.3)"
                  />
                </TouchableOpacity>
              </View>
            </View>

            {mode === 'register' && (
              <View className="mb-5">
                <Text className="text-white/40 text-xs font-bold uppercase tracking-widest mb-2">
                  Confirm Password
                </Text>
                <TextInput
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="••••••••"
                  placeholderTextColor="rgba(255,255,255,0.2)"
                  secureTextEntry={!showPassword}
                  className="bg-black/40 border border-white/10 rounded-2xl p-4 text-white"
                />
              </View>
            )}

            {/* Error Message */}
            {error && (
              <View className="bg-danger/10 border border-danger/30 rounded-2xl p-4 mb-5 flex-row items-center">
                <FontAwesome5 name="exclamation-triangle" size={14} color="#FF1744" />
                <Text className="text-danger text-sm ml-3 flex-1">{error}</Text>
              </View>
            )}

            {/* Submit Button */}
            <TouchableOpacity
              onPress={mode === 'login' ? handleLogin : handleRegister}
              disabled={isLoading}
              className={`py-5 rounded-3xl items-center ${mode === 'login' ? 'bg-primary neon-shadow-blue' : 'bg-secondary neon-shadow-green'} ${isLoading ? 'opacity-60' : ''}`}
            >
              {isLoading ? (
                <ActivityIndicator color={mode === 'login' ? '#0F172A' : '#0F172A'} />
              ) : (
                <Text className="text-background font-bold text-lg">
                  {mode === 'login' ? 'Authenticate' : 'Create Account'}
                </Text>
              )}
            </TouchableOpacity>
          </GlassCard>

          {/* Dev hint – mock credentials */}
          <TouchableOpacity
            onPress={fillDemoCredentials}
            className="mt-6 bg-white/5 border border-white/10 rounded-2xl p-4 flex-row items-center"
          >
            <View className="w-8 h-8 bg-white/10 rounded-full items-center justify-center mr-3">
              <FontAwesome5 name="flask" size={12} color="rgba(255,255,255,0.4)" />
            </View>
            <View className="flex-1">
              <Text className="text-white/40 text-xs font-bold uppercase tracking-widest">
                Dev Mode — Tap to fill credentials
              </Text>
              <Text className="text-white/20 text-xs font-mono mt-0.5">
                admin@shieldnet.local · Admin1234
              </Text>
            </View>
            <FontAwesome5 name="chevron-right" size={12} color="rgba(255,255,255,0.2)" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
