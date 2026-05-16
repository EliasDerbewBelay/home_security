import React, { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native'
import { useRouter } from 'expo-router'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { FontAwesome5 } from '@expo/vector-icons'
import { useAuthStore } from '@/store/authStore'
import { loginSchema, type LoginSchema } from '@/utils/validation/authSchemas'
import { GlassCard } from '@/components/ui/GlassCard'

export default function LoginScreen() {
  const router = useRouter()
  const { login, isLoading, error, clearError } = useAuthStore()
  const [showPassword, setShowPassword] = useState(false)

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const onSubmit = async (data: LoginSchema) => {
    try {
      await login(data)
      router.replace('/(tabs)')
    } catch (err) {
      // Error is handled by the store and displayed in the UI
    }
  }

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
        {error && (
          <View className="bg-red-500/20 border border-red-500/50 p-4 rounded-xl mb-6">
            <Text className="text-red-400 text-sm font-medium">{error}</Text>
          </View>
        )}

        <View className="mb-4">
          <Text className="text-white/60 text-xs mb-2">EMAIL ADDRESS</Text>
          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, onBlur, value } }) => (
              <View className="bg-black/20 rounded-xl p-4 border border-white/5">
                <TextInput
                  placeholder="operative@shieldnet.com"
                  placeholderTextColor="rgba(255,255,255,0.2)"
                  className="text-white"
                  onBlur={() => {
                    onBlur()
                    clearError()
                  }}
                  onChangeText={onChange}
                  value={value}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
              </View>
            )}
          />
          {errors.email && (
            <Text className="text-red-400 text-xs mt-1">{errors.email.message}</Text>
          )}
        </View>

        <View className="mb-2">
          <Text className="text-white/60 text-xs mb-2">PASSWORD</Text>
          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, onBlur, value } }) => (
              <View className="bg-black/20 rounded-xl p-4 border border-white/5 flex-row items-center">
                <TextInput
                  placeholder="••••••••"
                  placeholderTextColor="rgba(255,255,255,0.2)"
                  className="text-white flex-1"
                  onBlur={() => {
                    onBlur()
                    clearError()
                  }}
                  onChangeText={onChange}
                  value={value}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <FontAwesome5 name={showPassword ? 'eye-slash' : 'eye'} size={16} color="rgba(255,255,255,0.5)" />
                </TouchableOpacity>
              </View>
            )}
          />
          {errors.password && (
            <Text className="text-red-400 text-xs mt-1">{errors.password.message}</Text>
          )}
        </View>

        <View className="items-end mb-8">
          <TouchableOpacity>
            <Text className="text-primary text-xs">Forgot Password?</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          onPress={handleSubmit(onSubmit)}
          disabled={isLoading}
          className={`p-4 rounded-xl items-center flex-row justify-center ${isLoading ? 'bg-primary/50' : 'bg-primary'}`}
        >
          {isLoading ? (
            <ActivityIndicator color="#0F172A" className="mr-2" />
          ) : null}
          <Text className="text-background font-bold text-lg">
            {isLoading ? 'AUTHENTICATING...' : 'SIGN IN'}
          </Text>
        </TouchableOpacity>
      </GlassCard>

      <View className="flex-row justify-center mt-8">
        <Text className="text-white/40">Don't have an account? </Text>
        <TouchableOpacity onPress={() => {
            clearError()
            router.push('/register')
        }}>
          <Text className="text-primary font-bold">Register</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  )
}
