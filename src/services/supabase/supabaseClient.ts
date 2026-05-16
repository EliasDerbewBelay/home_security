import 'react-native-url-polyfill/auto'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL!,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  })

console.log('SUPABASE URL:', process.env.EXPO_PUBLIC_SUPABASE_URL)
console.log('SUPABASE KEY:', process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY?.slice(0, 20))