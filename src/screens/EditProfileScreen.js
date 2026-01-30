import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { useTheme } from "../Theme/ThemeContext";
import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";

export default function EditProfileScreen({ navigation }) {
  const { theme } = useTheme();
  const styles = makeStyles(theme);

  const [name, setName] = useState("Juan Pérez");
  const [phone, setPhone] = useState("555 123 4567");
  const [email] = useState("juan@email.com"); // 🔒 NO editable

  const handleSave = () => {
    Alert.alert(
      "Perfil actualizado",
      "Tu información personal se actualizó correctamente.",
      [
        {
          text: "Entendido",
          onPress: () => navigation.goBack(),
        },
      ],
    );
  };

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <Ionicons
          name="person-circle-outline"
          size={80}
          color={theme.colors.accent}
        />
        <Text style={styles.title}>Editar perfil</Text>
        <Text style={styles.subtitle}>Actualiza tu información personal</Text>
      </View>

      {/* FORM */}
      <View style={styles.form}>
        <Text style={styles.label}>Nombre completo</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Nombre completo"
        />

        <Text style={styles.label}>Teléfono</Text>
        <TextInput
          style={styles.input}
          value={phone}
          onChangeText={setPhone}
          placeholder="Teléfono"
          keyboardType="phone-pad"
        />

        <Text style={styles.label}>Correo electrónico</Text>
        <TextInput
          style={[styles.input, styles.disabledInput]}
          value={email}
          editable={false}
        />
        <Text style={styles.helperText}>
          Por seguridad, el correo electrónico no se puede modificar.
        </Text>
      </View>

      {/* ACTION */}
      <TouchableOpacity style={styles.button} onPress={handleSave}>
        <Ionicons
          name="save-outline"
          size={18}
          color={theme.colors.primary}
          style={{ marginRight: 6 }}
        />
        <Text style={styles.buttonText}>Guardar cambios</Text>
      </TouchableOpacity>
    </View>
  );
}

const makeStyles = (theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
      padding: 24,
    },
    header: {
      alignItems: "center",
      marginBottom: 30,
    },
    title: {
      fontSize: 22,
      fontWeight: "800",
      color: theme.colors.text,
      marginTop: 10,
    },
    subtitle: {
      fontSize: 14,
      color: theme.colors.subtext,
      marginTop: 4,
    },
    form: {
      marginBottom: 30,
    },
    label: {
      fontSize: 13,
      fontWeight: "600",
      color: theme.colors.subtext,
      marginBottom: 6,
    },
    input: {
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: 10,
      padding: 14,
      marginBottom: 14,
      color: theme.colors.text,
      backgroundColor: theme.colors.surface,
    },
    disabledInput: {
      backgroundColor: "#E5E5E5",
      color: "#777",
    },
    helperText: {
      fontSize: 12,
      color: theme.colors.subtext,
      marginTop: -6,
      marginBottom: 14,
    },
    button: {
      flexDirection: "row",
      backgroundColor: theme.colors.accent,
      paddingVertical: 16,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
    },
    buttonText: {
      fontWeight: "700",
      color: theme.colors.primary,
      fontSize: 16,
    },
  });
