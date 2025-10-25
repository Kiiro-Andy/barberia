import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useTheme } from "../Theme/ThemeContext";

import LoginScreen from "../screens/LoginScreen";
import HomeScreen from "../screens/HomeScreen";
import BookingScreen from "../screens/BookingScreen";
import AppointmentsScreen from "../screens/AppointmentsScreen";
import ProfileScreen from "../screens/ProfileScreen";

const Stack = createNativeStackNavigator();

export default function AppNavigation() {
	const { paperTheme } = useTheme();

	return (
		<NavigationContainer theme={paperTheme}>
			<Stack.Navigator
				initialRouteName="Login"
				screenOptions={{
					headerStyle: { backgroundColor: paperTheme.colors.card },
					headerTintColor: paperTheme.colors.text,
					headerTitleStyle: { fontWeight: "600" },
				}}
			>
				<Stack.Screen name="Login" component={LoginScreen} />
				<Stack.Screen name="Home" component={HomeScreen} />
				<Stack.Screen name="Booking" component={BookingScreen} />
				<Stack.Screen name="Appointments" component={AppointmentsScreen} />
				<Stack.Screen name="Profile" component={ProfileScreen} />
			</Stack.Navigator>
		</NavigationContainer>
	);
}
