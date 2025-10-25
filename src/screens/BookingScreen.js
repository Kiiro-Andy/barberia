import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Switch } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../Theme/ThemeContext";

export default function BookingScreen({ navigation }) {
	const { theme, toggleTheme, isDark } = useTheme();
	const styles = makeStyles(theme);

	return (
		<View style={styles.container}>
			{/* Switch de tema */}
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

			<Ionicons name="calendar-outline" size={28} color={theme.colors.accent} />
			<Text style={styles.title}>Reservar cita 💈</Text>
			<Text style={styles.subtitle}>
				Selecciona día, hora y servicio (simulado).
			</Text>

			<TouchableOpacity style={styles.button}>
				<Text style={styles.buttonText}>Elegir servicio</Text>
			</TouchableOpacity>

			<TouchableOpacity style={styles.button}>
				<Text style={styles.buttonText}>Elegir barbero</Text>
			</TouchableOpacity>

			<TouchableOpacity style={styles.button}>
				<Text style={styles.buttonText}>Confirmar cita</Text>
			</TouchableOpacity>

			<TouchableOpacity
				style={styles.backButton}
				onPress={() => navigation.navigate("Home")}
			>
				<Text style={styles.backText}>← Volver al inicio</Text>
			</TouchableOpacity>
		</View>
	);
}

const makeStyles = (theme) =>
	StyleSheet.create({
		container: {
			flex: 1,
			backgroundColor: theme.colors.background,
			justifyContent: "center",
			alignItems: "center",
			paddingHorizontal: 24,
		},
		switchRow: {
			position: "absolute",
			top: 40,
			right: 20,
			flexDirection: "row",
			alignItems: "center",
		},
		title: {
			fontSize: 28,
			fontWeight: "700",
			color: theme.colors.accent,
			marginBottom: 8,
			marginTop: 12,
		},
		subtitle: {
			color: theme.colors.subtext,
			fontSize: 14,
			marginBottom: 24,
			textAlign: "center",
		},
		button: {
			backgroundColor: theme.colors.accent,
			borderRadius: 10,
			paddingVertical: 14,
			alignItems: "center",
			width: "90%",
			marginVertical: 6,
		},
		buttonText: {
			color: theme.colors.primary,
			fontWeight: "700",
			fontSize: 16,
		},
		backButton: { marginTop: 20 },
		backText: { color: theme.colors.accent, fontWeight: "600" },
	});
