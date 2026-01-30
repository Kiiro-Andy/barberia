import React, { useRef, useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Animated,
  ScrollView,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../Theme/ThemeContext";

const { width } = Dimensions.get("window");

const SERVICES = [
  {
    id: "1",
    name: "Corte de cabello",
    image: require("../../assets/cut1.jpg"),
    description: "Corte clásico o moderno adaptado a tu estilo.",
    duration: "30 min",
    price: "$150 MXN",
  },
  {
    id: "2",
    name: "Barba",
    image: require("../../assets/cut2.jpg"),
    description: "Perfilado y arreglo profesional de barba.",
    duration: "20 min",
    price: "$100 MXN",
  },
  {
    id: "3",
    name: "Cejas",
    image: require("../../assets/cut3.jpg"),
    description: "Diseño y limpieza de cejas.",
    duration: "10 min",
    price: "$50 MXN",
  },
];

const WORKS = [
  require("../../assets/cut1.jpg"),
  require("../../assets/cut2.jpg"),
  require("../../assets/cut3.jpg"),
  require("../../assets/cut4.jpg"),
  require("../../assets/cut5.jpg"),
];

export default function HomeScreen({ navigation }) {
  const scrollX = useRef(new Animated.Value(0)).current;

  const { theme, isDark } = useTheme();
  const styles = makeStyles(theme, isDark);

  const servicesAnim = useRef(new Animated.Value(0)).current;
  const buttonsAnim = useRef(new Animated.Value(0)).current;

  const [expandedService, setExpandedService] = useState(null);

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
              <Ionicons
                name="calendar-outline"
                size={38}
                color={theme.colors.primary}
              />
              <Text
                style={[styles.mainButtonText, { color: theme.colors.primary }]}
              >
                Reservar cita
              </Text>
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
              <Ionicons
                name="time-outline"
                size={38}
                color={theme.colors.primary}
              />
              <Text
                style={[styles.mainButtonText, { color: theme.colors.primary }]}
              >
                Mis citas
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* CARRUSEL DE TRABAJOS */}
        <View style={{ marginBottom: 30 }}>
          <Text style={styles.sectionTitle}>Nuestros trabajos</Text>

          <Animated.ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            snapToAlignment="center"
            onScroll={Animated.event(
              [{ nativeEvent: { contentOffset: { x: scrollX } } }],
              { useNativeDriver: false },
            )}
            scrollEventThrottle={16}
          >
            {WORKS.map((img, index) => (
              <View key={index} style={styles.carouselItem}>
                <Image source={img} style={styles.carouselImage} />
              </View>
            ))}
          </Animated.ScrollView>

          {/* INDICADORES */}
          <View style={styles.dotsContainer}>
            {WORKS.map((_, i) => {
              const opacity = scrollX.interpolate({
                inputRange: [(i - 1) * 300, i * 300, (i + 1) * 300],
                outputRange: [0.3, 1, 0.3],
                extrapolate: "clamp",
              });

              return (
                <Animated.View
                  key={i}
                  style={[
                    styles.dot,
                    { opacity, backgroundColor: theme.colors.accent },
                  ]}
                />
              );
            })}
          </View>
        </View>

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
          {SERVICES.map((service) => {
            const isOpen = expandedService === service.id;

            return (
              <View key={service.id} style={styles.serviceItem}>
                <TouchableOpacity
                  style={styles.serviceHeader}
                  onPress={() => toggleService(service.id)}
                  activeOpacity={0.8}
                >
                  <View style={styles.serviceHeaderLeft}>
                    <Text style={styles.serviceName}>{service.name}</Text>
                    <Text style={styles.servicePrice}>{service.price}</Text>
                  </View>

                  <Ionicons
                    name={isOpen ? "chevron-up" : "chevron-down"}
                    size={22}
                    color={theme.colors.text}
                  />
                </TouchableOpacity>

                {isOpen && (
                  <View style={styles.serviceContent}>
                    <Image source={service.image} style={styles.serviceImage} />

                    <Text style={styles.serviceDescription}>
                      {service.description}
                    </Text>

                    <View style={styles.serviceMeta}>
                      <View style={styles.metaItem}>
                        <Ionicons
                          name="time-outline"
                          size={16}
                          color={theme.colors.info}
                        />
                        <Text style={styles.metaText}>{service.duration}</Text>
                      </View>

                      <View style={styles.metaItem}>
                        <Ionicons
                          name="cash-outline"
                          size={16}
                          color={theme.colors.info}
                        />
                        <Text style={styles.metaText}>{service.price}</Text>
                      </View>
                    </View>

                    <TouchableOpacity
                      style={styles.bookButton}
                      onPress={() =>
                        navigation.navigate("Booking", {
                          service,
                        })
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
    carouselItem: {
      width: width * 0.85,
      marginRight: 20,
      borderRadius: 20,
      overflow: "hidden",
      alignSelf: "center",
    },

    carouselImage: {
      width: "100%",
      height: 240,
      borderRadius: 20,
    },

    dotsContainer: {
      flexDirection: "row",
      justifyContent: "center",
      marginTop: 10,
      gap: 8,
    },

    dot: {
      width: 8,
      height: 8,
      borderRadius: 4,
    },
  });
