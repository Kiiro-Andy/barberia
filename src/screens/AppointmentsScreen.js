import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../Theme/ThemeContext";

export default function AppointmentsScreen({ navigation }) {
  const { theme } = useTheme();
  const styles = makeStyles(theme);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Ionicons name="time-outline" size={28} color={theme.colors.accent} />
      <Text style={styles.title}>Mis citas 📅</Text>
      <Text style={styles.subtitle}>
        Aquí se mostrarán tus citas activas y pasadas.
      </Text>

      {/* CITA */}
      {[...Array(4)].map((_, index) => (
        <View key={index} style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.serviceName}>Corte de cabello</Text>
            <Ionicons
              name="cut-outline"
              size={20}
              color={theme.colors.accent}
            />
          </View>

          <View style={styles.cardMeta}>
            <View style={styles.metaItem}>
              <Ionicons name="calendar-outline" size={16} color="#666" />
              <Text style={styles.metaText}>12 de Nov</Text>
            </View>

            <View style={styles.metaItem}>
              <Ionicons name="time-outline" size={16} color="#666" />
              <Text style={styles.metaText}>3:00 PM</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.repeatBtn}>
            <Text style={styles.repeatText}>Repetir servicio</Text>
          </TouchableOpacity>
        </View>
      ))}

      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.navigate("Home")}
      >
        <Text style={styles.backText}>← Volver al inicio</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const makeStyles = (theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },

    content: {
      paddingHorizontal: 24,
      paddingTop: 40,
      paddingBottom: 80,
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
      borderRadius: 14,
      padding: 16,
      width: "100%",
      marginBottom: 14,
      borderWidth: 1,
      borderColor: theme.colors.border || "#ddd",
    },

    cardHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 10,
    },

    serviceName: {
      fontSize: 16,
      fontWeight: "700",
      color: theme.colors.text,
    },

    cardMeta: {
      flexDirection: "row",
      justifyContent: "space-between",
      paddingVertical: 10,
      borderTopWidth: 1,
      borderBottomWidth: 1,
      borderColor: theme.colors.border || "#ddd",
      marginBottom: 14,
    },

    metaItem: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },

    metaText: {
      fontSize: 14,
      fontWeight: "500",
      color: theme.colors.text,
      opacity: 0.85,
    },

    repeatBtn: {
      backgroundColor: theme.colors.accent,
      paddingVertical: 12,
      borderRadius: 10,
      alignItems: "center",
    },

    repeatText: {
      color: theme.colors.primary,
      fontWeight: "700",
    },

    backButton: {
      marginTop: 30,
    },

    backText: {
      color: theme.colors.accent,
      fontWeight: "600",
    },
  });
