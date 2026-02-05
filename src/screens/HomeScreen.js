import React, { useRef, useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../Theme/ThemeContext";
import { supabase } from "../utils/supabase";

export default function HomeScreen({ navigation }) {
  const { theme, isDark } = useTheme();
  const styles = makeStyles(theme, isDark);

  const servicesAnim = useRef(new Animated.Value(0)).current;
  const buttonsAnim = useRef(new Animated.Value(0)).current;

  const [expandedService, setExpandedService] = useState(null);
  const [services, setServices] = useState([]);

  useEffect(() => {
    Animated.stagger(150, [
      Animated.timing(buttonsAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(servicesAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();

    const fetchServices = async () => {
      const { data, error } = await supabase
        .from('services')
        .select('id, nombre, precio, descripcion')
        .order('nombre');
      
      if (data && !error) {
        setServices(data);
      }
    };
    fetchServices();
  }, []);

  const toggleService = (id) => {
    setExpandedService(expandedService === id ? null : id);
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={{ paddingBottom: 80 }}>
        {/* BIENVENIDA */}
        <Animated.View
          style={[
            styles.welcomeContainer,
            {
              opacity: buttonsAnim,
              transform: [
                {
                  translateY: buttonsAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [20, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <Text style={styles.welcomeText}>¡Bienvenido!</Text>
          <Text style={styles.welcomeSubText}>
            Elige un servicio y agenda tu cita fácilmente
          </Text>
        </Animated.View>

        {/* BOTONES PRINCIPALES */}
        <Animated.View
          style={[
            styles.mainButtons,
            {
              opacity: buttonsAnim,
              transform: [
                {
                  translateY: buttonsAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [30, 0],
                  }),
                },
              ],
            },
          ]}
        >
          {/* BOTÓN RESERVAR */}
          <View style={styles.mainButtonShadow}>
            <TouchableOpacity
              style={[
                styles.mainButtonCard,
                { backgroundColor: theme.colors.accent },
              ]}
              onPress={() => navigation.navigate("Booking")}
              activeOpacity={0.7}
            >
              <Ionicons name="calendar-outline" size={38} color={theme.colors.primary} />
              <Text style={[styles.mainButtonText, { color: theme.colors.primary }]}>Reservar cita</Text>
            </TouchableOpacity>
          </View>

          {/* BOTÓN MIS CITAS */}
          <View style={styles.mainButtonShadow}>
            <TouchableOpacity
              style={[
                styles.mainButtonCard,
                { backgroundColor: theme.colors.accent },
              ]}
              onPress={() => navigation.navigate("Appointments")}
              activeOpacity={0.7}
            >
              <Ionicons name="time-outline" size={38} color={theme.colors.primary} />
              <Text style={[styles.mainButtonText, { color: theme.colors.primary }]}>Mis citas</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* SERVICIOS */}
        <Animated.Text
          style={[
            styles.sectionTitle,
            {
              opacity: servicesAnim,
              transform: [
                {
                  translateY: servicesAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [20, 0],
                  }),
                },
              ],
            },
          ]}
        >
          Servicios
        </Animated.Text>

        <View style={styles.scheduleContainer}>
          <Ionicons name="time-outline" size={18} color={theme.colors.info} />
          <Text style={styles.scheduleText}>
            Horario de atención: Lun a Sáb · 10:00 AM – 8:00 PM
          </Text>
        </View>

        <Animated.View
          style={{
            opacity: servicesAnim,
            transform: [
              {
                translateY: servicesAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [20, 0],
                }),
              },
            ],
          }}
        >
          {services.map((service) => {
            const isOpen = expandedService === service.id;

            return (
              <View key={service.id} style={styles.serviceItem}>
                <TouchableOpacity
                  style={styles.serviceHeader}
                  onPress={() => toggleService(service.id)}
                  activeOpacity={0.8}
                >
                  <View style={styles.serviceHeaderLeft}>
                    <Text style={styles.serviceName}>{service.nombre}</Text>
                    <Text style={styles.servicePrice}>{service.precio}</Text>
                  </View>

                  <Ionicons
                    name={isOpen ? "chevron-up" : "chevron-down"}
                    size={22}
                    color={theme.colors.text}
                  />
                </TouchableOpacity>

                {isOpen && (
                  <View style={styles.serviceContent}>
                    {service.descripcion && (
                      <Text style={styles.serviceDescription}>
                        {service.descripcion}
                      </Text>
                    )}
                    <View style={styles.serviceMeta}>
                      <View style={styles.metaItem}>
                        <Ionicons name="sparkles-outline" size={16} color={theme.colors.info} />
                        <Text style={styles.metaText}>{service.nombre}</Text>
                      </View>

                      <View style={styles.metaItem}>
                        <Ionicons name="cash-outline" size={16} color={theme.colors.info} />
                        <Text style={styles.metaText}>{service.precio}</Text>
                      </View>
                    </View>

                    <TouchableOpacity
                      style={styles.bookButton}
                      onPress={() =>
                        navigation.navigate("Booking")
                      }
                    >
                      <Text style={styles.bookButtonText}>
                        Reservar este servicio
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            );
          })}
        </Animated.View>
      </View>
    </ScrollView>
  );
}

const makeStyles = (theme, isDark) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
      paddingHorizontal: 20,
      paddingTop: 40,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: "700",
      color: theme.colors.text,
      marginBottom: 12,
    },

    serviceItem: {
      backgroundColor: theme.colors.surface,
      borderRadius: 14,
      marginBottom: 14,
      borderWidth: 1,
      borderColor: isDark ? theme.colors.info : "#d6d6d6",
      overflow: "hidden",
    },
    serviceHeader: {
      padding: 16,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    serviceHeaderLeft: {
      flexDirection: "column",
    },
    serviceName: {
      fontSize: 16,
      fontWeight: "600",
      color: theme.colors.text,
    },
    servicePrice: {
      fontSize: 13,
      fontWeight: "600",
      color: theme.colors.accent,
      marginTop: 2,
    },
    serviceContent: {
      padding: 16,
      paddingTop: 0,
    },
    serviceImage: {
      width: "100%",
      height: 200,
      borderRadius: 12,
      marginBottom: 12,
    },
    serviceDescription: {
      fontSize: 14,
      color: theme.colors.text,
      opacity: 0.85,
      marginBottom: 16,
      lineHeight: 20,
    },
    serviceMeta: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 20,
      paddingVertical: 10,
      borderTopWidth: 1,
      borderColor: isDark ? "#333" : "#e0e0e0",
    },
    metaItem: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    metaText: {
      fontSize: 14,
      fontWeight: "500",
      color: theme.colors.text,
    },
    bookButton: {
      backgroundColor: theme.colors.accent,
      paddingVertical: 14,
      borderRadius: 12,
      alignItems: "center",
    },
    bookButtonText: {
      color: "#fff",
      fontWeight: "700",
      fontSize: 15,
    },

    mainButtons: {
      flexDirection: "row",
      justifyContent: "space-around",
      marginBottom: 25,
      gap: 20,
    },
    mainButtonShadow: {
      flex: 1,
      borderRadius: 18,
      overflow: "hidden",
      shadowColor: "#000",
      shadowOpacity: 0.15,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 4 },
      elevation: 4,
    },
    mainButtonCard: {
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 26,
      borderRadius: 18,
      gap: 8,
    },
    mainButtonText: {
      color: "#fff",
      fontWeight: "600",
      fontSize: 15,
      marginTop: 6,
      textAlign: "center",
    },
    welcomeContainer: {
      marginBottom: 25,
    },

    welcomeText: {
      fontSize: 22,
      fontWeight: "800",
      color: theme.colors.text,
    },

    welcomeSubText: {
      fontSize: 14,
      marginTop: 4,
      color: theme.colors.info,
      opacity: 0.7,
    },

    scheduleContainer: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      marginBottom: 18,
      paddingHorizontal: 4,
    },

    scheduleText: {
      fontSize: 13,
      fontWeight: "500",
      color: theme.colors.text,
      opacity: 0.8,
    },
  });
