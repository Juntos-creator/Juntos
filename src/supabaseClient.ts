import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';

// Usa las variables del archivo .env del proyecto activo.
const supabaseUrl =
  process.env.EXPO_PUBLIC_SUPABASE_URL ||
  'https://sb_publishable_zitDgY_AycCCUS-QIl17sA_Tm3b6mDs.supabase.co';
const supabaseAnonKey =
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNzamJ0cGJ3enlkaGxyZWR0cWlzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA4OTYyNjAsImV4cCI6MjEwNjQ3MjI2MH0.HS2ptlso6Pcs4mG8U1vDMT9Npk1htewGrzVEEJr_CCs';

const authStorage = {
  getItem: (key: string) => {
    if (Platform.OS !== 'web') return AsyncStorage.getItem(key);
    return typeof window === 'undefined'
      ? Promise.resolve(null)
      : Promise.resolve(window.localStorage.getItem(key));
  },
  setItem: (key: string, value: string) => {
    if (Platform.OS !== 'web') return AsyncStorage.setItem(key, value);
    if (typeof window !== 'undefined') window.localStorage.setItem(key, value);
    return Promise.resolve();
  },
  removeItem: (key: string) => {
    if (Platform.OS !== 'web') return AsyncStorage.removeItem(key);
    if (typeof window !== 'undefined') window.localStorage.removeItem(key);
    return Promise.resolve();
  },
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: authStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});