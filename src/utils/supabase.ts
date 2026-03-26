
import 'react-native-url-polyfill/auto'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { createClient } from '@supabase/supabase-js'
import Constants from 'expo-constants'

// Implementacion de un lock personalizado para React Native
const customLock = async (name: string, acquireTimeout: number, fn: () => Promise<any>) => {
  // Simplemente ejecuta la función sin bloqueo real
  // Esto es seguro en React Native ya que es single-threaded
  return await fn();
};

const expoExtra = (Constants.expoConfig?.extra ?? {}) as {
  supabaseUrl?: string
  supabaseAnonKey?: string
}

const supabaseUrl =
  process.env.EXPO_PUBLIC_SUPABASE_URL ??
  process.env.SUPABASE_URL ??
  expoExtra.supabaseUrl

const supabaseAnonKey =
  process.env.EXPO_PUBLIC_SUPABASE_KEY ??
  process.env.SUPABASE_ANON_KEY ??
  expoExtra.supabaseAnonKey

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    '[supabase] Missing config. Set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_KEY, or provide SUPABASE_URL and SUPABASE_ANON_KEY at build time.'
  )
}

export const supabase = createClient(
    supabaseUrl || 'https://invalid.supabase.co',
    supabaseAnonKey || 'invalid-anon-key',
    {
        auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
        lock: customLock,
        },
    })
        