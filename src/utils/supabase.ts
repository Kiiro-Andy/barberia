
import 'react-native-url-polyfill/auto'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { createClient } from '@supabase/supabase-js'
import { LockFunc } from '@supabase/gotrue-js'

// Implementación de un lock personalizado para React Native
const customLock: LockFunc = async (name, acquireTimeout, fn) => {
  // Simplemente ejecuta la función sin bloqueo real
  // Esto es seguro en React Native ya que es single-threaded
  return await fn();
};

export const supabase = createClient(
    process.env.EXPO_PUBLIC_SUPABASE_URL!,
    process.env.EXPO_PUBLIC_SUPABASE_KEY!,
    {
        auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
        lock: customLock,
        },
    })
        