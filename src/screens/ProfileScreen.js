import React from "react";
import {
	View,
	Text,
	Image,
	TouchableOpacity,
	StyleSheet,
	Switch,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../Theme/ThemeContext";

export default function ProfileScreen({ navigation }) {
	const { theme, toggleTheme, isDark } = useTheme();
	const styles = makeStyles(theme);

	return (
		<View style={styles.container}>
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

			<Image
				source={
					isDark ? require("../../assets/icon-light.png") : require("../../assets/icon-dark.png")
				}
				style={styles.avatar}
			/>
			<Text style={styles.name}>Juan Pérez</Text>
			<Text style={styles.info}>Barbero favorito: Carlos</Text>
			<Text style={styles.info}>Servicio preferido: Corte + Barba</Text>

			<TouchableOpacity style={styles.button}>
				<Text style={styles.buttonText}>Editar perfil</Text>
			</TouchableOpacity>

			<TouchableOpacity
				style={[styles.button, styles.logoutButton]}
				onPress={() => navigation.navigate("Login")}
			>
				<Ionicons
					name="log-out-outline"
					size={18}
					color={isDark ? "#fff" : "#fff"}
					style={{ marginRight: 6 }}
				/>
				<Text style={styles.logoutText}>Cerrar sesión</Text>
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
		avatar: { width: 100, height: 100, borderRadius: 50, marginBottom: 15 },
		name: { fontSize: 22, fontWeight: "bold", color: theme.colors.accent },
		info: { color: theme.colors.subtext, marginVertical: 3 },
		button: {
			backgroundColor: theme.colors.accent,
			paddingVertical: 14,
			borderRadius: 10,
			marginTop: 20,
			width: "80%",
			alignItems: "center",
		},
		buttonText: {
			color: theme.colors.primary,
			fontWeight: "700",
			fontSize: 16,
		},
		backButton: { marginTop: 20 },
		backText: { color: theme.colors.accent, fontWeight: "600" },
		logoutButton: {
			backgroundColor: "#C06060",
			flexDirection: "row",
			justifyContent: "center",
			alignItems: "center",
		},
		logoutText: {
			color: "#fff",
			fontWeight: "700",
			fontSize: 16,
		},
		backButton: {
			marginTop: 20,
		},
		backText: {
			color: theme.colors.accent,
			fontWeight: "600",
		},
	});
