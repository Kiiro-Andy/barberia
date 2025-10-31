import React from "react";
import {
	View,
	Text,
	TouchableOpacity,
	StyleSheet,
	StatusBar
} from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useTheme } from "../Theme/ThemeContext";
import { Ionicons } from "@expo/vector-icons";

import LoginScreen from "../screens/LoginScreen";
import HomeScreen from "../screens/HomeScreen";
import BookingScreen from "../screens/BookingScreen";
import AppointmentsScreen from "../screens/AppointmentsScreen";
import ProfileScreen from "../screens/ProfileScreen";
import RegisterScreen from "../screens/RegisterScreen";

const Stack = createNativeStackNavigator();

export default function AppNavigation() {
	const { paperTheme, isDark } = useTheme();

	const CustomHeader = ({ title, navigation }) => (
		<>
			{/* Cambia el color de la barra de estado según el tema */}
			<StatusBar
				barStyle={isDark ? "light-content" : "dark-content"}
				backgroundColor={paperTheme.colors.backgroundHeader}
			/>
			<View
				style={[
					styles.customHeader,
					{
						backgroundColor: paperTheme.colors.backgroundHeader,
						shadowColor: isDark ? "#000" : "#333",
					},
				]}
			>
				<Text
					style={[
						styles.headerTitle,
						{ color: paperTheme.colors.accent },
					]}
				>
					{title}
				</Text>

				<TouchableOpacity onPress={() => navigation.navigate("Profile")}>
					<Ionicons
						name="person-circle-outline"
						size={38}
						color={paperTheme.colors.accent || "#C0A060"}
					/>
				</TouchableOpacity>
			</View>
		</>
	);

	return (
		<NavigationContainer theme={paperTheme}>
			<Stack.Navigator initialRouteName="Login">
				{/* Pantallas sin header */}
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

				{/* Pantallas con header personalizado */}
				<Stack.Screen
					name="Home"
					component={HomeScreen}
					options={({ navigation }) => ({
						header: () => (
							<CustomHeader title="Barberia" navigation={navigation} />
						),
					})}
				/>
				<Stack.Screen
					name="Booking"
					component={BookingScreen}
					options={({ navigation }) => ({
						header: () => (
							<CustomHeader title="Reservar Cita" navigation={navigation} />
						),
					})}
				/>
				<Stack.Screen
					name="Appointments"
					component={AppointmentsScreen}
					options={({ navigation }) => ({
						header: () => (
							<CustomHeader title="Mis Citas" navigation={navigation} />
						),
					})}
				/>
				<Stack.Screen
					name="Profile"
					component={ProfileScreen}
					options={({ navigation }) => ({
						header: () => (
							<CustomHeader title="Perfil" navigation={navigation} />
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
		justifyContent: "space-between",
		alignItems: "center",
		paddingHorizontal: 20,
		paddingTop: 50,
		paddingBottom: 20,
		borderBottomLeftRadius: 25,
		borderBottomRightRadius: 25,
		shadowColor: "#000",
		shadowOpacity: 0.25,
		shadowOffset: { width: 0, height: 4 },
		elevation: 6,
	},
	headerTitle: {
		fontSize: 22,
		fontWeight: "700",
	},
});
