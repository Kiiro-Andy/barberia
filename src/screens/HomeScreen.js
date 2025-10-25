import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Switch } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../Theme/ThemeContext";

export default function HomeScreen({ navigation }) {
	const { theme, toggleTheme, isDark } = useTheme();
	const styles = makeStyles(theme);

	return (
		<View style={styles.container}>
			<View style={styles.headerRow}>
				<Text style={styles.title}>Inicio</Text>

				{/* Switch para cambiar tema */}
				<View style={styles.switchRow}>
					<Ionicons
						name={isDark ? "moon" : "sunny"}
						size={20}
						color={theme.colors.accent}
						style={{ marginRight: 6 }}
					/>
					<Switch
						value={isDark}
						onValueChange={toggleTheme}
						trackColor={{ false: "#999", true: "#C0A060" }}
						thumbColor={isDark ? "#111" : "#fff"}
					/>
				</View>
			</View>

			<TouchableOpacity
				style={styles.card}
				onPress={() => navigation.navigate("Booking")}
			>
				<Ionicons name="calendar-outline" size={22} color="#C0A060" />
				<Text style={styles.cardText}>Reservar cita</Text>
			</TouchableOpacity>

			<TouchableOpacity
				style={styles.card}
				onPress={() => navigation.navigate("Appointments")}
			>
				<Ionicons name="time-outline" size={22} color="#C0A060" />
				<Text style={styles.cardText}>Mis citas</Text>
			</TouchableOpacity>

			<TouchableOpacity
				style={styles.card}
				onPress={() => navigation.navigate("Profile")}
			>
				<Ionicons name="person-outline" size={22} color="#C0A060" />
				<Text style={styles.cardText}>Perfil</Text>
			</TouchableOpacity>
		</View>
	);
}

const makeStyles = (theme) =>
	StyleSheet.create({
		container: {
			flex: 1,
			backgroundColor: theme.colors.background,
			padding: 20,
		},
		headerRow: {
			flexDirection: "row",
			justifyContent: "space-between",
			alignItems: "center",
			marginBottom: 18,
		},
		title: {
			fontSize: 24,
			fontWeight: "700",
			color: theme.colors.text,
		},
		switchRow: {
			flexDirection: "row",
			alignItems: "center",
		},
		card: {
			flexDirection: "row",
			alignItems: "center",
			backgroundColor: theme.colors.surface,
			padding: 16,
			borderRadius: 12,
			marginTop: 12,
			marginBottom: 10,
			gap: 12,
		},
		cardText: {
			fontSize: 16,
			color: theme.colors.text,
			fontWeight: "600",
		},
	});
