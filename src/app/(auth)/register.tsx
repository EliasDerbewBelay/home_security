import React, { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from 'react-native'
import { useRouter } from 'expo-router'
import { useForm, Controller, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { FontAwesome5 } from '@expo/vector-icons'
import { useAuthStore } from '@/store/authStore'
import { registerSchema, type RegisterSchema } from '@/utils/validation/authSchemas'
import { GlassCard } from '@/components/ui/GlassCard'

export default function RegisterScreen() {
  const router = useRouter()
  const { register, isLoading, error, clearError } = useAuthStore()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterSchema>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
    mode: 'onBlur',
  })

  const passwordValue = useWatch({ control, name: 'password' })

  const getPasswordStrength = (pass: string) => {
    let score = 0
    if (!pass) return { score: 0, text: '', color: 'bg-transparent' }
    if (pass.length >= 8) score += 1
    if (/[A-Z]/.test(pass)) score += 1
    if (/[0-9]/.test(pass)) score += 1
    if (/[^A-Za-z0-9]/.test(pass)) score += 1

    if (score <= 1) return { score, text: 'Weak', color: 'bg-red-500' }
    if (score === 2) return { score, text: 'Medium', color: 'bg-yellow-500' }
    return { score, text: 'Strong', color: 'bg-green-500' }
  }

  const strength = getPasswordStrength(passwordValue || '')

  const onSubmit = async (data: RegisterSchema) => {
    try {
      await register(data)
      router.replace('/(tabs)')
    } catch (err) {
      // Error handled by store
    }
  }

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-background"
    >
      <ScrollView contentContainerStyle={{ padding: 24, flexGrow: 1, justifyContent: 'center' }}>
        <View className="items-center mb-8 mt-10">
          <View className="w-16 h-16 bg-secondary/20 rounded-2xl items-center justify-center mb-4 neon-shadow-green">
            <FontAwesome5 name="user-plus" size={24} color="#00E676" />
          </View>
          <Text className="text-white text-2xl font-bold tracking-wider">Initialize Profile</Text>
          <Text className="text-white/40 mt-2 text-center px-4">Register your secure credentials to access the network</Text>
        </View>

        <GlassCard className="p-6">
          {error && (
            <View className="bg-red-500/20 border border-red-500/50 p-4 rounded-xl mb-6">
              <Text className="text-red-400 text-sm font-medium">{error}</Text>
            </View>
          )}

          {/* Full Name */}
          <View className="mb-4">
            <Text className="text-white/60 text-xs mb-2">FULL NAME</Text>
            <Controller
              control={control}
              name="fullName"
              render={({ field: { onChange, onBlur, value } }) => (
                <View className="bg-black/20 rounded-xl p-4 border border-white/5 flex-row items-center">
                  <FontAwesome5 name="user" size={14} color="rgba(255,255,255,0.3)" className="mr-3" />
                  <TextInput
                    placeholder="John Doe"
                    placeholderTextColor="rgba(255,255,255,0.2)"
                    className="text-white flex-1 ml-2"
                    onBlur={() => { onBlur(); clearError(); }}
                    onChangeText={onChange}
                    value={value}
                  />
                </View>
              )}
            />
            {errors.fullName && <Text className="text-red-400 text-xs mt-1">{errors.fullName.message}</Text>}
          </View>

          {/* Email */}
          <View className="mb-4">
            <Text className="text-white/60 text-xs mb-2">SECURE EMAIL</Text>
            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, onBlur, value } }) => (
                <View className="bg-black/20 rounded-xl p-4 border border-white/5 flex-row items-center">
                  <FontAwesome5 name="envelope" size={14} color="rgba(255,255,255,0.3)" className="mr-3" />
                  <TextInput
                    placeholder="operative@shieldnet.com"
                    placeholderTextColor="rgba(255,255,255,0.2)"
                    className="text-white flex-1 ml-2"
                    onBlur={() => { onBlur(); clearError(); }}
                    onChangeText={onChange}
                    value={value}
                    autoCapitalize="none"
                    keyboardType="email-address"
                  />
                </View>
              )}
            />
            {errors.email && <Text className="text-red-400 text-xs mt-1">{errors.email.message}</Text>}
          </View>

          {/* Password */}
          <View className="mb-4">
            <Text className="text-white/60 text-xs mb-2">ENCRYPTION KEY</Text>
            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, onBlur, value } }) => (
                <View className="bg-black/20 rounded-xl p-4 border border-white/5 flex-row items-center">
                  <FontAwesome5 name="shield-alt" size={14} color="rgba(255,255,255,0.3)" className="mr-3" />
                  <TextInput
                    placeholder="••••••••"
                    placeholderTextColor="rgba(255,255,255,0.2)"
                    className="text-white flex-1 ml-2"
                    onBlur={() => { onBlur(); clearError(); }}
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
            {passwordValue ? (
              <View className="flex-row items-center mt-2 h-1 w-full bg-white/10 rounded-full overflow-hidden">
                <View className={`h-full ${strength.color}`} style={{ width: `${(strength.score / 3) * 100}%` }} />
              </View>
            ) : null}
            {errors.password && <Text className="text-red-400 text-xs mt-1">{errors.password.message}</Text>}
          </View>

          {/* Confirm Password */}
          <View className="mb-8">
            <Text className="text-white/60 text-xs mb-2">CONFIRM KEY</Text>
            <Controller
              control={control}
              name="confirmPassword"
              render={({ field: { onChange, onBlur, value } }) => (
                <View className="bg-black/20 rounded-xl p-4 border border-white/5 flex-row items-center">
                  <FontAwesome5 name="check-double" size={14} color="rgba(255,255,255,0.3)" className="mr-3" />
                  <TextInput
                    placeholder="••••••••"
                    placeholderTextColor="rgba(255,255,255,0.2)"
                    className="text-white flex-1 ml-2"
                    onBlur={() => { onBlur(); clearError(); }}
                    onChangeText={onChange}
                    value={value}
                    secureTextEntry={!showConfirmPassword}
                  />
                  <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                    <FontAwesome5 name={showConfirmPassword ? 'eye-slash' : 'eye'} size={16} color="rgba(255,255,255,0.5)" />
                  </TouchableOpacity>
                </View>
              )}
            />
            {errors.confirmPassword && <Text className="text-red-400 text-xs mt-1">{errors.confirmPassword.message}</Text>}
          </View>

          <TouchableOpacity 
            onPress={handleSubmit(onSubmit)}
            disabled={isLoading}
            className={`py-5 rounded-2xl items-center flex-row justify-center neon-shadow-green ${isLoading ? 'bg-secondary/50' : 'bg-secondary'}`}
          >
            {isLoading && <ActivityIndicator color="#0F172A" className="mr-2" />}
            <Text className="text-background font-bold text-lg tracking-[2px] uppercase">
              {isLoading ? 'INITIALIZING...' : 'Create Account'}
            </Text>
          </TouchableOpacity>
        </GlassCard>

        <View className="flex-row justify-center mt-8 mb-4">
          <Text className="text-white/40">Already registered? </Text>
          <TouchableOpacity onPress={() => {
              clearError()
              router.push('/login')
          }}>
            <Text className="text-secondary font-bold">Access Terminal</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}
