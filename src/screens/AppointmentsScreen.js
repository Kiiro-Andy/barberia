import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Switch } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../Theme/ThemeContext";

export default function AppointmentsScreen({ navigation }) {
	const { theme, toggleTheme, isDark } = useTheme();
	const styles = makeStyles(theme);

	return (
		<View style={styles.container}>

			<Ionicons name="time-outline" size={28} color={theme.colors.accent} />
			<Text style={styles.title}>Mis citas 📅</Text>
			<Text style={styles.subtitle}>
				Aquí se mostrarán tus citas activas y pasadas.
			</Text>

			<View style={styles.card}>
				<Text style={styles.cardText}>
					💇 Corte de cabello - 12 de Nov, 3:00 PM
				</Text>
				<TouchableOpacity style={styles.repeatBtn}>
					<Text style={styles.repeatText}>Repetir servicio</Text>
				</TouchableOpacity>
			</View>
			<View style={styles.card}>
				<Text style={styles.cardText}>
					💇 Corte de cabello - 12 de Ene, 5:00 PM
				</Text>
				<TouchableOpacity style={styles.repeatBtn}>
					<Text style={styles.repeatText}>Repetir servicio</Text>
				</TouchableOpacity>
			</View>
			<View style={styles.card}>
				<Text style={styles.cardText}>
					💇 Corte de cabello - 12 de Nov, 3:00 PM
				</Text>
				<TouchableOpacity style={styles.repeatBtn}>
					<Text style={styles.repeatText}>Repetir servicio</Text>
				</TouchableOpacity>
			</View>
			<View style={styles.card}>
				<Text style={styles.cardText}>
					💇 Corte de cabello - 12 de Nov, 3:00 PM
				</Text>
				<TouchableOpacity style={styles.repeatBtn}>
					<Text style={styles.repeatText}>Repetir servicio</Text>
				</TouchableOpacity>
			</View>

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
			marginBottom: 20,
			textAlign: "center",
		},
		card: {
			backgroundColor: theme.colors.surface,
			borderRadius: 12,
			padding: 16,
			width: "90%",
			marginBottom: 12,
		},
		cardText: { color: theme.colors.text, fontWeight: "600" },
		repeatBtn: {
			backgroundColor: theme.colors.accent,
			paddingVertical: 10,
			borderRadius: 8,
			marginTop: 10,
			alignItems: "center",
		},
		repeatText: {
			color: theme.colors.primary,
			fontWeight: "700",
		},
		backButton: { marginTop: 20 },
		backText: { color: theme.colors.accent, fontWeight: "600" },
	});
