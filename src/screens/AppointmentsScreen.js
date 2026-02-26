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

      const today = new Date().toISOString().split('T')[0];

      // 1. First get all appointments
      const { data: appointmentsData, error: appointmentsError } = await supabase
        .from('appointments')
        .select('*')
        .eq('user_id', user.id)
        .gte('fecha', today) // Solo mostrar citas de hoy en adelante
        .order('fecha', { ascending: true });

      if (appointmentsError) {
        console.error('Error al cargar citas:', appointmentsError);
        setAppointments([]);
        return;
      }

      if (!appointmentsData || appointmentsData.length === 0) {
        setAppointments([]);
        return;
      }

      // 2. For each appointment, get the services from the junction table
      const appointmentsWithServices = await Promise.all(
        appointmentsData.map(async (appointment) => {
          // Get services for this appointment from the junction table
          const { data: servicesData, error: servicesError } = await supabase
            .from('appointment_services')
            .select(`
              service_id,
              services (
                id,
                nombre,
                precio
              )
            `)
            .eq('appointment_id', appointment.id);

          if (servicesError) {
            console.error('Error al cargar servicios:', servicesError);
            return { ...appointment, servicesList: [] };
          }

          // Extract service names
          const servicesList = servicesData
            ?.map(item => item.services?.nombre)
            .filter(Boolean) || [];

          return {
            ...appointment,
            servicesList,
            services: servicesList.join(' + ') // Keep for backward compatibility
          };
        })
      );

      setAppointments(appointmentsWithServices);
    } catch (error) {
      console.error('Error:', error);
      setAppointments([]);
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
    if (!services) return 'sparkles-outline';
    const lowerServices = services.toLowerCase();
    if (lowerServices.includes('corte')) return 'cut-outline';
    if (lowerServices.includes('barba')) return 'man-outline';
    if (lowerServices.includes('ceja')) return 'eye-outline';
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
          const fecha = new Date((appointment.fecha || '2025-01-01') + 'T00:00:00');
          const fechaStr = fecha.toLocaleDateString('es-MX', { 
            weekday: 'short',
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
          });

          return (
            <View key={appointment.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.serviceName}>{appointment.services || 'Servicio'}</Text>
                <Ionicons
                  name={getServiceIcon(appointment.services)}
                  size={20}
                  color={theme.colors.accent}
                />
              </View>

              <View style={styles.barberInfo}>
                <Ionicons name="person-outline" size={16} color={theme.colors.accent} />
                <Text style={styles.barberText}>{appointment.barber_name || 'Barbero'}</Text>
              </View>

              <View style={styles.cardMeta}>
                <View style={styles.metaItem}>
                  <Ionicons name="calendar-outline" size={16} color="#666" />
                  <Text style={styles.metaText}>{fechaStr}</Text>
                </View>

                <View style={styles.metaItem}>
                  <Ionicons name="time-outline" size={16} color="#666" />
                  <Text style={styles.metaText}>{appointment.hora_inicio || appointment.time || '--:--'}</Text>
                </View>
              </View>

              <View style={styles.statusBadge}>
                <Text style={styles.statusText}>
                  {appointment.estado === 'pendiente' ? '⏳ Pendiente' : 
                   appointment.estado === 'confirmed' ? '✓ Confirmada' : 
                   appointment.estado || appointment.status || 'Estado'}
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
