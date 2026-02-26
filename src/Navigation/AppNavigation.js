import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Image,
  ActivityIndicator,
} from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useTheme } from "../Theme/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "../utils/supabase";

import LoginScreen from "../screens/LoginScreen";
import HomeScreen from "../screens/HomeScreen";
import BookingScreen from "../screens/BookingScreen";
import AppointmentsScreen from "../screens/AppointmentsScreen";
import HistoryScreen from "../screens/HistoryScreen";
import ProfileScreen from "../screens/ProfileScreen";
import RegisterScreen from "../screens/RegisterScreen";

const Stack = createNativeStackNavigator();

export default function AppNavigation() {
  const { paperTheme, isDark } = useTheme(); // isDark aquí para TODO
  const [profileImage, setProfileImage] = useState(null);
  const [imageLoading, setImageLoading] = useState(true);

  // Theme colors
  const headerBg = isDark ? "#141414" : paperTheme.colors.surface;
  const headerText = isDark ? "#FFFFFF" : paperTheme.colors.onSurface;
  const accent = "#C0A060";

  // Fetch profile image
  useEffect(() => {
    fetchProfileImage();
  }, []);

  const fetchProfileImage = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setProfileImage(user.user_metadata?.avatar_url || null);
      } else {
        setProfileImage(null);
      }
    } catch (error) {
      console.error('Error:', error);
      setProfileImage(null);
    } finally {
      setImageLoading(false);
    }
  };

  const CustomHeader = ({ title, navigation, canGoBack }) => (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#141414" />
      <View style={[styles.customHeader, { backgroundColor: headerBg }]}>
        {/* IZQUIERDA */}
        <View style={styles.left}>
          {canGoBack && (
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Ionicons name="chevron-back" size={26} color={accent} />
            </TouchableOpacity>
          )}
          <Text style={[styles.headerTitle, { color: headerText }]}>
            {title}
          </Text>
        </View>

        {/* DERECHA - IMAGEN */}
        <TouchableOpacity onPress={() => navigation.navigate("Profile")}>
          {imageLoading ? (
            <ActivityIndicator size={20} color={accent} />
          ) : profileImage ? (
            <Image
              source={{ uri: profileImage }}
              style={{ width: 38, height: 38, borderRadius: 19 }}
              resizeMode="cover"
            />
          ) : (
            <Ionicons name="person-circle-outline" size={38} color={accent} />
          )}
        </TouchableOpacity>
      </View>
    </>
  );

  return (
    <NavigationContainer theme={paperTheme}>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Register"
          component={RegisterScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={({ navigation }) => ({
            header: () => <CustomHeader title="Barberia" navigation={navigation} />,
          })}
        />
        <Stack.Screen
          name="Booking"
          component={BookingScreen}
          options={({ navigation }) => ({
            header: () => (
              <CustomHeader title="Reservar Cita" navigation={navigation} canGoBack />
            ),
          })}
        />
        <Stack.Screen
          name="Appointments"
          component={AppointmentsScreen}
          options={({ navigation }) => ({
            header: () => (
              <CustomHeader title="Mis Citas" navigation={navigation} canGoBack />
            ),
          })}
        />
        <Stack.Screen
          name="History"
          component={HistoryScreen}
          options={({ navigation }) => ({
            header: () => (
              <CustomHeader title="Historial" navigation={navigation} canGoBack />
            ),
          })}
        />
        <Stack.Screen
          name="Profile"
          component={ProfileScreen}
          options={({ navigation }) => ({
            header: () => (
              <CustomHeader title="Perfil" navigation={navigation} canGoBack />
            ),
          })}
        />
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
    shadowColor: "#000",
    shadowOpacity: 0.35,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  left: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "800",
    letterSpacing: 0.6,
  },
});
