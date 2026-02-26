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
	Modal,
	Pressable,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
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
	
	// Estados para la foto de perfil
	const [profileImage, setProfileImage] = useState(null);
	const [uploadingImage, setUploadingImage] = useState(false);
	const [showImagePicker, setShowImagePicker] = useState(false);

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
					avatar_url: user.user_metadata?.avatar_url || null,
				});
				setEditedName(user.user_metadata?.nombre || user.user_metadata?.display_name || 'Usuario');
				setProfileImage(user.user_metadata?.avatar_url || null);
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

	// Función para tomar o seleccionar foto
	const pickImage = async (useCamera) => {
		setShowImagePicker(false);
		
		const permissionResult = useCamera 
			? await ImagePicker.requestCameraPermissionsAsync()
			: await ImagePicker.requestMediaLibraryPermissionsAsync();

		if (!permissionResult.granted) {
			Alert.alert("Permiso requerido", "Necesitas otorgar permiso para acceder a tus fotos.");
			return;
		}

		const result = useCamera
			? await ImagePicker.launchCameraAsync({
				allowsEditing: true,
				aspect: [1, 1],
				quality: 1,
			})
			: await ImagePicker.launchImageLibraryAsync({
				allowsEditing: true,
				aspect: [1, 1],
				quality: 1,
			});

		if (!result.canceled && result.assets[0]) {
			await uploadProfileImage(result.assets[0].uri);
		}
	};

	// Función para subir imagen a Supabase
	const uploadProfileImage = async (uri) => {
		setUploadingImage(true);
		try {
			const { data: { user } } = await supabase.auth.getUser();
			
			if (!user) {
				Alert.alert("Error", "No se encontró el usuario");
				return;
			}

			// Nombre único para el archivo
			const fileName = `${user.id}_${Date.now()}.jpg`;
			
			// Crear FormData para subir el archivo
			const formData = new FormData();
			formData.append('file', {
				uri: uri,
				type: 'image/jpeg',
				name: fileName,
			});
			
			// Subir a Supabase Storage usando FormData
			const { data, error } = await supabase.storage
				.from('Usuarios')
				.upload(`perfiles/${fileName}`, formData, {
					cacheControl: '3600',
					upsert: false,
					contentType: 'multipart/form-data',
				});

			if (error) {
				console.error('Error uploading:', error);
				Alert.alert("Error", "No se pudo subir la imagen: " + error.message);
				return;
			}

			// Construir la URL manualmente
			const projectUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://your-project.supabase.co';
			const publicUrl = `${projectUrl}/storage/v1/object/public/Usuarios/perfiles/${fileName}`;
			
			console.log('Public URL:', publicUrl);
			
			// También mostrar localmente la imagen
			setProfileImage(uri);

			// Actualizar user_metadata con la URL de la imagen
			const { error: updateError } = await supabase.auth.updateUser({
				data: {
					avatar_url: publicUrl,
				}
			});

			if (updateError) {
				console.error('Error updating user:', updateError);
				Alert.alert("Error", "No se pudo guardar la foto de perfil");
			} else {
				setUserData(prev => ({ ...prev, avatar_url: publicUrl }));
				Alert.alert("Éxito", "Foto de perfil actualizada");
			}
		} catch (error) {
			console.error('Error:', error);
			Alert.alert("Error", "Ocurrió un error al procesar la imagen");
		} finally {
			setUploadingImage(false);
		}
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
					<TouchableOpacity 
						onPress={() => setShowImagePicker(true)}
						style={styles.avatarContainer}
					>
						<Image
							source={
								profileImage 
									? { uri: profileImage }
									: (isDark ? require("../../assets/icon-light.png") : require("../../assets/icon-dark.png"))
							}
							style={styles.avatar}
						/>
						<View style={styles.editAvatarButton}>
							<Ionicons name="camera" size={16} color="#fff" />
						</View>
						{uploadingImage && (
							<View style={styles.uploadingOverlay}>
								<ActivityIndicator size="small" color="#fff" />
							</View>
						)}
					</TouchableOpacity>

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

					{/* Modal para seleccionar imagen */}
					<Modal
						visible={showImagePicker}
						transparent
						animationType="slide"
						onRequestClose={() => setShowImagePicker(false)}
					>
						<Pressable 
							style={styles.modalOverlay}
							onPress={() => setShowImagePicker(false)}
						>
							<View style={styles.modalContent}>
								<Text style={styles.modalTitle}>Cambiar foto de perfil</Text>
								
								<TouchableOpacity 
									style={styles.modalOption}
									onPress={() => pickImage(true)}
								>
									<Ionicons name="camera" size={24} color={theme.colors.accent} />
									<Text style={styles.modalOptionText}>Tomar foto</Text>
								</TouchableOpacity>

								<TouchableOpacity 
									style={styles.modalOption}
									onPress={() => pickImage(false)}
								>
									<Ionicons name="images" size={24} color={theme.colors.accent} />
									<Text style={styles.modalOptionText}>Elegir de galería</Text>
								</TouchableOpacity>

								<TouchableOpacity 
									style={[styles.modalOption, styles.cancelOption]}
									onPress={() => setShowImagePicker(false)}
								>
									<Text style={styles.cancelText}>Cancelar</Text>
								</TouchableOpacity>
							</View>
						</Pressable>
					</Modal>
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
		// Estilos para foto de perfil
		avatarContainer: {
			position: "relative",
			marginBottom: 15,
		},
		editAvatarButton: {
			position: "absolute",
			bottom: 0,
			right: 0,
			backgroundColor: theme.colors.accent,
			borderRadius: 12,
			padding: 6,
		},
		uploadingOverlay: {
			position: "absolute",
			top: 0,
			left: 0,
			right: 0,
			bottom: 0,
			backgroundColor: "rgba(0,0,0,0.5)",
			borderRadius: 50,
			justifyContent: "center",
			alignItems: "center",
		},
		// Estilos del modal
		modalOverlay: {
			flex: 1,
			backgroundColor: "rgba(0,0,0,0.5)",
			justifyContent: "flex-end",
		},
		modalContent: {
			backgroundColor: theme.colors.surface,
			borderTopLeftRadius: 20,
			borderTopRightRadius: 20,
			padding: 20,
			paddingBottom: 40,
		},
		modalTitle: {
			fontSize: 18,
			fontWeight: "bold",
			color: theme.colors.text,
			textAlign: "center",
			marginBottom: 20,
		},
		modalOption: {
			flexDirection: "row",
			alignItems: "center",
			padding: 15,
			borderRadius: 10,
			gap: 15,
		},
		modalOptionText: {
			fontSize: 16,
			color: theme.colors.text,
		},
		cancelOption: {
			marginTop: 10,
			justifyContent: "center",
		},
		cancelText: {
			fontSize: 16,
			color: "#ff6b6b",
		},
	});
//joserama