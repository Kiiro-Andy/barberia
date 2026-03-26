import 'dotenv/config'; // Esto carga tu .env local en desarrollo

export default {
  expo: {
    name: "barbershop",
    slug: "barbershop",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/logo.png",
    userInterfaceStyle: "light",
    newArchEnabled: true,
    notification: {
      icon: "./assets/logo.png",
      color: "#000000",
      iosDisplayInForeground: true
    },
    splash: {
      image: "./assets/logo.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff"
    },
    ios: {
      supportsTablet: true
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/logo.png",
        backgroundColor: "#ffffff"
      },
      googleServicesFile: process.env.GOOGLE_SERVICES_JSON || "./google-services.json",
      edgeToEdgeEnabled: true,
      package: "com.elrobertds.barbershop"
    },
    web: {
      favicon: "./assets/logo.png"
    },
    plugins: [
      "expo-asset",
      "expo-font",
      "expo-notifications",
      "@react-native-community/datetimepicker"
    ],
    extra: {
      eas: {
        projectId: "034715c3-bb2e-48e4-b540-6eb0bd57079b"
      },
      supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL,
      supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_KEY || process.env.SUPABASE_ANON_KEY
    }
  }
};