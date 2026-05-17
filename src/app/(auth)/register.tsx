import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth } from '@/config/firebaseConfig';
import { FontAwesome5 } from '@expo/vector-icons';

export default function RegisterScreen() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleRegister = async () => {
    if (!fullName || !email || !password || !confirmPassword) {
      setError('Please fill in all fields.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
      
      await updateProfile(userCredential.user, {
        displayName: fullName.trim()
      });
      setLoading(false);
      router.replace('/(tabs)');
    } catch (err: any) {
      console.error(err);
      let message = 'An error occurred during registration.';
      if (err.code === 'auth/email-already-in-use') {
        message = 'This email is already registered.';
      } else if (err.code === 'auth/weak-password') {
        message = 'Password should be at least 6 characters.';
      } else if (err.code === 'auth/invalid-email') {
        message = 'Please enter a valid email address.';
      } else if (err.message) {
        message = err.message;
      }
      setError(message);
      setLoading(false);
    }
  };

  return (
    <ScrollView className="flex-1 bg-background" contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', paddingHorizontal: 24, paddingVertical: 40 }}>
      <View className="items-center mb-8">
        <View className="w-16 h-16 bg-primary/20 rounded-full items-center justify-center mb-4 border border-primary/50 neon-shadow-blue">
          <FontAwesome5 name="user-plus" size={24} color="#00E5FF" />
        </View>
        <Text className="text-white text-2xl font-bold tracking-widest uppercase">Create Account</Text>
        <Text className="text-white/60 text-sm mt-2 text-center">Join the Security Hub to secure your premises</Text>
      </View>

      {error ? (
        <View className="bg-danger/20 border border-danger/50 p-3 rounded-lg mb-6">
          <Text className="text-danger text-center">{error}</Text>
        </View>
      ) : null}

      <View className="space-y-4">
        <View>
          <Text className="text-white/80 text-xs uppercase font-bold tracking-widest mb-2">Full Name</Text>
          <TextInput
            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-4 text-white"
            placeholder="Enter your full name"
            placeholderTextColor="rgba(255, 255, 255, 0.3)"
            autoCapitalize="words"
            value={fullName}
            onChangeText={(text) => { setFullName(text); setError(''); }}
            editable={!loading}
          />
        </View>

        <View className="mt-4">
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
            placeholder="Create a password"
            placeholderTextColor="rgba(255, 255, 255, 0.3)"
            secureTextEntry
            value={password}
            onChangeText={(text) => { setPassword(text); setError(''); }}
            editable={!loading}
          />
        </View>

        <View className="mt-4">
          <Text className="text-white/80 text-xs uppercase font-bold tracking-widest mb-2">Confirm Password</Text>
          <TextInput
            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-4 text-white"
            placeholder="Confirm your password"
            placeholderTextColor="rgba(255, 255, 255, 0.3)"
            secureTextEntry
            value={confirmPassword}
            onChangeText={(text) => { setConfirmPassword(text); setError(''); }}
            editable={!loading}
          />
        </View>
      </View>

      <TouchableOpacity
        className={`w-full rounded-xl py-4 items-center justify-center mt-8 ${loading ? 'bg-primary/50' : 'bg-primary'} shadow-lg shadow-primary/30`}
        onPress={handleRegister}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#0F172A" />
        ) : (
          <Text className="text-[#0F172A] font-bold text-lg uppercase tracking-widest">Register</Text>
        )}
      </TouchableOpacity>

      <View className="mt-8 flex-row justify-center">
        <Text className="text-white/60">Already have an account? </Text>
        <TouchableOpacity onPress={() => router.push('/(auth)/login')} disabled={loading}>
          <Text className="text-primary font-bold">Sign In</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
