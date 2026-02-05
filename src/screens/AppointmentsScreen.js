import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../Theme/ThemeContext";
import { supabase } from "../utils/supabase";
import { useFocusEffect } from "@react-navigation/native";

export default function AppointmentsScreen({ navigation }) {
  const { theme } = useTheme();
  const styles = makeStyles(theme);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAppointments = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setAppointments([]);
        return;
      }

      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .eq('user_id', user.id)
        .order('fecha', { ascending: false });

      if (error) {
        console.error('Error al cargar citas:', error);
      } else {
        setAppointments(data || []);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      fetchAppointments();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchAppointments();
  };

  const getServiceIcon = (services) => {
    if (services.toLowerCase().includes('corte')) return 'cut-outline';
    if (services.toLowerCase().includes('barba')) return 'man-outline';
    if (services.toLowerCase().includes('ceja')) return 'eye-outline';
    return 'sparkles-outline';
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <Ionicons name="time-outline" size={28} color={theme.colors.accent} />
      <Text style={styles.title}>Mis citas 📅</Text>
      <Text style={styles.subtitle}>
        Aquí se mostrarán tus citas activas y pasadas.
      </Text>

      {loading ? (
        <ActivityIndicator size="large" color={theme.colors.accent} style={{ marginTop: 20 }} />
      ) : appointments.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="calendar-outline" size={64} color={theme.colors.subtext} />
          <Text style={styles.emptyText}>No tienes citas agendadas</Text>
          <TouchableOpacity 
            style={styles.bookButton}
            onPress={() => navigation.navigate('Booking')}
          >
            <Text style={styles.bookButtonText}>Agendar una cita</Text>
          </TouchableOpacity>
        </View>
      ) : (
        appointments.map((appointment) => {
          // Formatear la fecha
          const fecha = new Date(appointment.fecha + 'T00:00:00');
          const fechaStr = fecha.toLocaleDateString('es-MX', { 
            weekday: 'short',
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
          });

          return (
            <View key={appointment.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.serviceName}>{appointment.services}</Text>
                <Ionicons
                  name={getServiceIcon(appointment.services)}
                  size={20}
                  color={theme.colors.accent}
                />
              </View>

              <View style={styles.barberInfo}>
                <Ionicons name="person-outline" size={16} color={theme.colors.accent} />
                <Text style={styles.barberText}>{appointment.barber_name}</Text>
              </View>

              <View style={styles.cardMeta}>
                <View style={styles.metaItem}>
                  <Ionicons name="calendar-outline" size={16} color="#666" />
                  <Text style={styles.metaText}>{fechaStr}</Text>
                </View>

                <View style={styles.metaItem}>
                  <Ionicons name="time-outline" size={16} color="#666" />
                  <Text style={styles.metaText}>{appointment.time}</Text>
                </View>
              </View>

              <View style={styles.statusBadge}>
                <Text style={styles.statusText}>
                  {appointment.status === 'confirmed' ? '✓ Confirmada' : appointment.status}
                </Text>
              </View>
            </View>
          );
        })
      )}

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

    barberInfo: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      marginTop: 8,
    },

    barberText: {
      color: theme.colors.text,
      fontSize: 14,
      fontWeight: "500",
    },

    statusBadge: {
      backgroundColor: theme.colors.accent + '20',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 12,
      alignSelf: "flex-start",
      marginTop: 12,
    },

    statusText: {
      color: theme.colors.accent,
      fontSize: 12,
      fontWeight: "600",
    },

    emptyState: {
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 40,
    },

    emptyText: {
      color: theme.colors.subtext,
      fontSize: 16,
      marginTop: 16,
      marginBottom: 24,
    },

    bookButton: {
      backgroundColor: theme.colors.accent,
      paddingHorizontal: 24,
      paddingVertical: 12,
      borderRadius: 10,
    },

    bookButtonText: {
      color: theme.colors.primary,
      fontSize: 16,
      fontWeight: "600",
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
