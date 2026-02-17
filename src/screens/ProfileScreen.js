import React, { useState, useEffect } from "react";
import {
	View,
	Text,
	Image,
	TouchableOpacity,
	StyleSheet,
	Switch,
	ActivityIndicator,
	TextInput,
	Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../Theme/ThemeContext";
import { supabase } from "../utils/supabase";

export default function ProfileScreen({ navigation }) {
	const { theme, toggleTheme, isDark } = useTheme();
	const styles = makeStyles(theme);
	const [userData, setUserData] = useState(null);
	const [loading, setLoading] = useState(true);
	const [isEditing, setIsEditing] = useState(false);
	const [editedName, setEditedName] = useState("");
	const [saving, setSaving] = useState(false);

	useEffect(() => {
		fetchUserData();
	}, []);

	const fetchUserData = async () => {
		try {
			const { data: { user }, error } = await supabase.auth.getUser();
			
			if (error) {
				console.error('Error al obtener usuario:', error);
				return;
			}

			if (user) {
				setUserData({
					nombre: user.user_metadata?.nombre || user.user_metadata?.display_name || 'Usuario',
					email: user.email,
				});
				setEditedName(user.user_metadata?.nombre || user.user_metadata?.display_name || 'Usuario');
			}
		} catch (error) {
			console.error('Error:', error);
		} finally {
			setLoading(false);
		}
	};

	const handleSaveName = async () => {
		if (!editedName.trim()) {
			Alert.alert("Error", "El nombre no puede estar vacío");
			return;
		}

		setSaving(true);
		try {
			const { data: { user } } = await supabase.auth.getUser();
			
			if (!user) {
				Alert.alert("Error", "No se encontró el usuario");
				return;
			}

			// Actualizar el nombre en user_metadata
			const { error } = await supabase.auth.updateUser({
				data: {
					nombre: editedName.trim(),
					display_name: editedName.trim()
				}
			});

			if (error) {
				console.error('Error al actualizar:', error);
				Alert.alert("Error", "No se pudo actualizar el nombre");
			} else {
				setUserData(prev => ({ ...prev, nombre: editedName.trim() }));
				setIsEditing(false);
				Alert.alert("Éxito", "Nombre actualizado correctamente");
			}
		} catch (error) {
			console.error('Error:', error);
			Alert.alert("Error", "Ocurrió un error al guardar");
		} finally {
			setSaving(false);
		}
	};

	const handleCancelEdit = () => {
		setEditedName(userData?.nombre || 'Usuario');
		setIsEditing(false);
	};

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

			{loading ? (
				<ActivityIndicator size="large" color={theme.colors.accent} />
			) : (
				<>
					<Image
						source={
							isDark ? require("../../assets/icon-light.png") : require("../../assets/icon-dark.png")
						}
						style={styles.avatar}
					/>

					{isEditing ? (
						<View style={styles.editContainer}>
							<Text style={styles.label}>Nombre:</Text>
							<TextInput
								style={styles.input}
								value={editedName}
								onChangeText={setEditedName}
								placeholder="Ingresa tu nombre"
								placeholderTextColor={theme.colors.subtext}
								autoFocus
							/>
							<View style={styles.buttonRow}>
								<TouchableOpacity
									style={[styles.button, styles.cancelButton]}
									onPress={handleCancelEdit}
								>
									<Text style={styles.buttonText}>Cancelar</Text>
								</TouchableOpacity>
								<TouchableOpacity
									style={[styles.button, styles.saveButton]}
									onPress={handleSaveName}
									disabled={saving}
								>
									{saving ? (
										<ActivityIndicator size="small" color={theme.colors.primary} />
									) : (
										<Text style={styles.buttonText}>Guardar</Text>
									)}
								</TouchableOpacity>
							</View>
						</View>
					) : (
						<>
							<Text style={styles.name}>{userData?.nombre || 'Usuario'}</Text>
							<Text style={styles.info}>{userData?.email || ''}</Text>
							<Text style={styles.info}>Barbero favorito: Carlos</Text>
							<Text style={styles.info}>Servicio preferido: Corte + Barba</Text>

							<TouchableOpacity 
								style={styles.button}
								onPress={() => setIsEditing(true)}
							>
								<Text style={styles.buttonText}>Editar perfil</Text>
							</TouchableOpacity>
						</>
					)}

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
				</>
			)}
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
		editContainer: {
			width: "80%",
			alignItems: "center",
			marginTop: 15,
		},
		label: {
			fontSize: 14,
			color: theme.colors.subtext,
			alignSelf: "flex-start",
			marginBottom: 5,
		},
		input: {
			width: "100%",
			backgroundColor: theme.colors.card,
			borderWidth: 1,
			borderColor: theme.colors.border,
			borderRadius: 10,
			padding: 12,
			fontSize: 16,
			color: theme.colors.text,
			marginBottom: 15,
		},
		buttonRow: {
			flexDirection: "row",
			justifyContent: "space-between",
			width: "100%",
		},
		cancelButton: {
			backgroundColor: "#666",
			width: "45%",
		},
		saveButton: {
			width: "45%",
		},
	});
