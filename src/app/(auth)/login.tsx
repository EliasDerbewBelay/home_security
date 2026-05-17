import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/config/firebaseConfig';
import { FontAwesome5 } from '@expo/vector-icons';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      setLoading(false);
      router.replace('/(tabs)');
    } catch (err: any) {
      console.error(err);
      let message = 'An error occurred during login.';
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        message = 'Invalid email or password.';
      } else if (err.code === 'auth/too-many-requests') {
        message = 'Too many failed attempts. Please try again later.';
      } else if (err.message) {
        message = err.message;
      }
      setError(message);
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-background justify-center px-6">
      <View className="items-center mb-10">
        <View className="w-20 h-20 bg-primary/20 rounded-full items-center justify-center mb-4 border border-primary/50 neon-shadow-blue">
          <FontAwesome5 name="shield-alt" size={40} color="#00E5FF" />
        </View>
        <Text className="text-white text-3xl font-bold tracking-widest uppercase">Security Hub</Text>
        <Text className="text-white/60 text-sm mt-2">Sign in to your account</Text>
      </View>

      {error ? (
        <View className="bg-danger/20 border border-danger/50 p-3 rounded-lg mb-6">
          <Text className="text-danger text-center">{error}</Text>
        </View>
      ) : null}

      <View className="space-y-4">
        <View>
          <Text className="text-white/80 text-xs uppercase font-bold tracking-widest mb-2">Email Address</Text>
          <TextInput
            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-4 text-white"
            placeholder="Enter your email"
            placeholderTextColor="rgba(255, 255, 255, 0.3)"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={(text) => { setEmail(text); setError(''); }}
            editable={!loading}
          />
        </View>

        <View className="mt-4">
          <Text className="text-white/80 text-xs uppercase font-bold tracking-widest mb-2">Password</Text>
          <TextInput
            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-4 text-white"
            placeholder="Enter your password"
            placeholderTextColor="rgba(255, 255, 255, 0.3)"
            secureTextEntry
            value={password}
            onChangeText={(text) => { setPassword(text); setError(''); }}
            editable={!loading}
          />
        </View>
      </View>

      <TouchableOpacity
        className={`w-full rounded-xl py-4 items-center justify-center mt-8 ${loading ? 'bg-primary/50' : 'bg-primary'} shadow-lg shadow-primary/30`}
        onPress={handleLogin}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#0F172A" />
        ) : (
          <Text className="text-[#0F172A] font-bold text-lg uppercase tracking-widest">Sign In</Text>
        )}
      </TouchableOpacity>

      <View className="mt-8 flex-row justify-center">
        <Text className="text-white/60">Don't have an account? </Text>
        <TouchableOpacity onPress={() => router.push('/(auth)/register')} disabled={loading}>
          <Text className="text-primary font-bold">Sign Up</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
