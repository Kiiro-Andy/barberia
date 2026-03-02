import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Switch,
  Alert,
} from "react-native";
import { Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../Theme/ThemeContext";
import { supabase } from "../utils/supabase";

export default function LoginScreen({ navigation }) {
  const { toggleTheme, isDark, theme } = useTheme();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const styles = makeStyles(theme);

  const handleLogin = async () => {
    // Validaciones
    if (!email.trim()) {
      Alert.alert("Error", "Por favor ingresa tu correo");
      return;
    }

    if (!password) {
      Alert.alert("Error", "Por favor ingresa tu contraseña");
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password: password,
      });

      if (error) {
        console.error('Error de login:', error);
        
        // Mensajes de error más específicos
        if (error.message.includes('Invalid login credentials')) {
          Alert.alert("Error", "Correo o contraseña incorrectos");
        } else if (error.message.includes('Email not confirmed')) {
          Alert.alert("Error", "Por favor confirma tu correo electrónico");
        } else {
          Alert.alert("Error de inicio de sesión", error.message);
        }
      } else {
        
        // Verificar el rol del usuario
        const { data: userData, error: userError } = await supabase
          .from('profiles')
          .select('rol')
          .eq('id', data.user.id)
          .single();

        if (userError) {
          console.error('Error al obtener datos del usuario:', userError);
          await supabase.auth.signOut();
          Alert.alert("Error", "No se pudo verificar tu información de usuario");
          return;
        }

        if (userData.rol !== 'cliente') {
          await supabase.auth.signOut();
          Alert.alert("Acceso denegado", "Esta aplicación es solo para clientes");
          return;
        }

        // Navegar a Home si el login fue exitoso y es cliente
        navigation.navigate("Home");
      }
    } catch (error) {
      console.error('Error catch:', error);
      Alert.alert(
        "Error inesperado", 
        "No se pudo iniciar sesión. Verifica tu conexión a internet."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Encabezado */}
      <Ionicons name="cut-outline" size={26} color="#C0A060" />
      <View
        style={{
          width: 40,
          height: 2,
          backgroundColor: theme.colors.secondary, // vino
          marginBottom: 10,
        }}
      />
      <Text style={styles.title}>BarberApp</Text>
      <Text style={styles.subtitle}>Inicia sesión para continuar</Text>

      {/* Formulario */}
      <View style={styles.form}>
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
            keyboardType="email-address"
            autoCapitalize="none"
            editable={!loading}
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
            editable={!loading}
          />
        </View>

        <TouchableOpacity
          style={[styles.button, loading && { opacity: 0.6 }]}
          onPress={handleLogin}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? "Iniciando sesión..." : "Entrar"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Pie de página */}
      <Text style={styles.footerText}>
        ¿No tienes cuenta?{" "}
        <Text
          style={styles.linkText}
          onPress={() => navigation.navigate("Register")}
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
    linkText: { color: "#1A73E8", fontWeight: "700" },
  });

