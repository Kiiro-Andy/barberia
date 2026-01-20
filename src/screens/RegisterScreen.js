import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Switch,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../Theme/ThemeContext";

export default function RegisterScreen({ navigation }) {
  const { toggleTheme, isDark, theme } = useTheme();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const styles = makeStyles(theme);

  return (
    <View style={styles.container}>
      {/* Encabezado */}
      <Ionicons name="cut-outline" size={26} color={theme.colors.accent} />
      <View
				style={{
					width: 40,
					height: 2,
					backgroundColor: theme.colors.secondary, // vino
					marginBottom: 10,
				}}
			/>
      <Text style={styles.title}>Crear cuenta</Text>
      <Text style={styles.subtitle}>Regístrate para continuar</Text>

      {/* Formulario */}
      <View style={styles.form}>
        <View style={styles.inputContainer}>
          <Ionicons
            name="person-outline"
            size={20}
            color={theme.colors.info}
            style={styles.icon}
          />
          <TextInput
            style={styles.input}
            placeholder="Nombre"
            placeholderTextColor="#aaa"
            value={name}
            onChangeText={setName}
          />
        </View>

        <View style={styles.inputContainer}>
          <Ionicons
            name="mail-outline"
            size={20}
            color={theme.colors.info}
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
            color={theme.colors.info}
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

        <View style={styles.inputContainer}>
          <Ionicons
            name="lock-closed-outline"
            size={20}
            color={theme.colors.info}
            style={styles.icon}
          />
          <TextInput
            style={styles.input}
            placeholder="Confirmar contraseña"
            placeholderTextColor="#aaa"
            secureTextEntry
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />
        </View>

        <TouchableOpacity
          style={styles.button}
          onPress={() => alert("Registro exitoso")}
        >
          <Text style={styles.buttonText}>Registrarse</Text>
        </TouchableOpacity>
      </View>

      {/* Pie de página */}
      <Text style={styles.footerText}>
        ¿Ya tienes cuenta?{" "}
        <Text
          style={styles.linkText}
          onPress={() => navigation.navigate("Login")}
        >
          Inicia sesión
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
      fontSize: 32,
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
      borderWidth: 1,
      borderColor: theme.colors.info,
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
    footerText: { color: theme.colors.secondary, marginTop: 20, fontSize: 13 },
    linkText: { color:"#1A73E8", fontWeight: "700" },
  });
