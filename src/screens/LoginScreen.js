import React, { useState } from "react";
import {
	View,
	Text,
	TextInput,
	TouchableOpacity,
	StyleSheet,
	Switch,
} from "react-native";
import { Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../Theme/ThemeContext";

export default function LoginScreen({ navigation }) {
	const { toggleTheme, isDark, theme } = useTheme();
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");

	const styles = makeStyles(theme);

	return (
		<View style={styles.container}>
			<View
				style={{ flexDirection: "row", alignItems: "center", marginTop: 20 }}
			>
				<Ionicons
					name={isDark ? "moon" : "sunny"}
					size={18}
					color={theme.colors.accent}
					style={{ marginRight: 8 }}
				/>
				<Switch
					value={isDark}
					onValueChange={toggleTheme}
					trackColor={{ false: "#999", true: "#C0A060" }}
					thumbColor={isDark ? "#111" : "#fff"}
				/>
			</View>
			{/* Encabezado */}
			<Ionicons name="cut-outline" size={26} color="#C0A060" />
			<Text style={styles.title}>BarberApp</Text>
			<Text style={styles.subtitle}>Inicia sesión para continuar</Text>

			{/* Formulario */}
			<View style={styles.form}>
				<View style={styles.inputContainer}>
					<Ionicons
						name="mail-outline"
						size={20}
						color="#C0A060"
						style={styles.icon}
					/>
					<TextInput
						style={styles.input}
						placeholder="Correo electrónico"
						placeholderTextColor="#aaa"
						value={email}
						onChangeText={setEmail}
					/>
				</View>

				<View style={styles.inputContainer}>
					<Ionicons
						name="lock-closed-outline"
						size={20}
						color="#C0A060"
						style={styles.icon}
					/>
					<TextInput
						style={styles.input}
						placeholder="Contraseña"
						placeholderTextColor="#aaa"
						secureTextEntry
						value={password}
						onChangeText={setPassword}
					/>
				</View>

				<TouchableOpacity
					style={styles.button}
					onPress={() => navigation.navigate("Home")}
				>
					<Text style={styles.buttonText}>Entrar</Text>
				</TouchableOpacity>
			</View>

			{/* Pie de página */}
			<Text style={styles.footerText}>
				¿No tienes cuenta?{" "}
				<Text
					style={styles.linkText}
					onPress={() => alert("Registro no funcional aún")}
				>
					Regístrate
				</Text>
			</Text>
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
		title: {
			fontSize: 36,
			fontWeight: "700",
			color: theme.colors.accent,
			marginBottom: 6,
		},
		subtitle: {
			color: theme.colors.subtext,
			fontSize: 14,
			marginBottom: 28,
		},
		form: {
			width: "100%",
		},
		inputContainer: {
			flexDirection: "row",
			alignItems: "center",
			backgroundColor: theme.colors.surface,
			borderRadius: 10,
			paddingHorizontal: 12,
			marginBottom: 12,
			height: 50,
		},
		icon: { marginRight: 10 },
		input: {
			flex: 1,
			color: theme.colors.text,
			height: Platform.OS === "android" ? 50 : 40,
		},
		button: {
			backgroundColor: theme.colors.accent,
			borderRadius: 10,
			paddingVertical: 14,
			alignItems: "center",
			marginTop: 6,
		},
		buttonText: {
			color: theme.colors.primary,
			fontWeight: "700",
			fontSize: 16,
		},
		footerText: { color: theme.colors.subtext, marginTop: 20, fontSize: 13 },
		linkText: { color: theme.colors.accent, fontWeight: "700" },
	});
