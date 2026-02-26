import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, StatusBar } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";

import { useTheme } from "../Theme/ThemeContext";
import { usePushNotifications } from "../hooks/usePushNotifications";
import { supabase } from "../utils/supabase";

import LoginScreen from "../screens/LoginScreen";
import HomeScreen from "../screens/HomeScreen";
import BookingScreen from "../screens/BookingScreen";
import AppointmentsScreen from "../screens/AppointmentsScreen";
import ProfileScreen from "../screens/ProfileScreen";
import RegisterScreen from "../screens/RegisterScreen";

const Stack = createNativeStackNavigator();

export default function AppNavigation() {
  const { paperTheme, isDark } = useTheme();
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    // 1. Verificar si ya hay una sesión activa
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setUserId(session.user.id);
    });

    // 2. Escuchar cambios en la autenticación (Login/Logout)
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserId(session?.user?.id || null);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // 3. Activamos el hook de notificaciones pasándole el userId
  const { expoPushToken } = usePushNotifications(userId);

  const headerBg = isDark ? "#141414" : paperTheme.colors.surface;
  const headerText = isDark ? "#FFFFFF" : paperTheme.colors.onSurface;
  const accent = "#C0A060";

  const CustomHeader = ({ title, navigation, canGoBack }) => (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#141414" />
      <View style={[styles.customHeader, { backgroundColor: headerBg }]}>
        <View style={styles.left}>
          {canGoBack && (
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Ionicons name="chevron-back" size={26} color={accent} />
            </TouchableOpacity>
          )}
          <Text style={[styles.headerTitle, { color: headerText }]}>{title}</Text>
        </View>
        <TouchableOpacity onPress={() => navigation.navigate("Profile")}>
          <Ionicons name="person-circle-outline" size={38} color={accent} />
        </TouchableOpacity>
      </View>
    </>
  );

  return (
    <NavigationContainer theme={paperTheme}>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Register" component={RegisterScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Home" component={HomeScreen} options={({ navigation }) => ({
          header: () => <CustomHeader title="Barberia" navigation={navigation} />,
        })} />
        <Stack.Screen name="Booking" component={BookingScreen} options={({ navigation }) => ({
          header: () => <CustomHeader title="Reservar Cita" navigation={navigation} canGoBack />,
        })} />
        <Stack.Screen name="Appointments" component={AppointmentsScreen} options={({ navigation }) => ({
          header: () => <CustomHeader title="Mis Citas" navigation={navigation} canGoBack />,
        })} />
        <Stack.Screen name="Profile" component={ProfileScreen} options={({ navigation }) => ({
          header: () => <CustomHeader title="Perfil" navigation={navigation} canGoBack />,
        })} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  customHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 48,
    paddingBottom: 18,
    borderBottomLeftRadius: 22,
    borderBottomRightRadius: 22,
    elevation: 8,
  },
  left: { flexDirection: "row", alignItems: "center", gap: 10 },
  headerTitle: { fontSize: 20, fontWeight: "800", letterSpacing: 0.6 },
});