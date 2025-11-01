import React, { useRef } from "react";
import {
	View,
	Text,
	TouchableOpacity,
	StyleSheet,
	Image,
	FlatList,
	Animated,
	Dimensions,
	ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../Theme/ThemeContext";

const { width } = Dimensions.get("window");
const IMAGES = [
	require("../../assets/cut1.jpg"),
	require("../../assets/cut2.jpg"),
	require("../../assets/cut3.jpg"),
	require("../../assets/cut4.jpg"),
	require("../../assets/cut5.jpg"),
];

export default function HomeScreen({ navigation }) {
	const { theme, toggleTheme, isDark } = useTheme();
	const styles = makeStyles(theme, isDark);
	const scrollX = useRef(new Animated.Value(0)).current;

	return (
		<ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
			<View style={{ paddingBottom: 80 }}>
				{/* SECCIÓN: PROMOCIÓN DESTACADA */}
				<View style={styles.promoCard}>
					<View style={styles.promoTextContainer}>
						<Text style={styles.promoTitle}>Descuento Especial</Text>
						<Text style={styles.promoSubtitle}>Hasta un 30% OFF</Text>
						<TouchableOpacity style={styles.promoButton}>
							<Text style={styles.promoButtonText}>Reservar ahora</Text>
						</TouchableOpacity>
					</View>
					<Image
						source={require("../../assets/barber-banner.jpg")}
						style={styles.promoImage}
					/>
				</View>

				{/* CARRUSEL DE ESTILOS */}
				<Text style={styles.sectionTitle}>Estilos</Text>

				<View>
					<Animated.FlatList
						data={IMAGES}
						keyExtractor={(_, index) => index.toString()}
						horizontal
						showsHorizontalScrollIndicator={false}
						pagingEnabled
						snapToAlignment="center"
						decelerationRate="fast"
						bounces={false}
						onScroll={Animated.event(
							[{ nativeEvent: { contentOffset: { x: scrollX } } }],
							{ useNativeDriver: false }
						)}
						renderItem={({ item, index }) => (
							<View style={styles.carouselCard}>
								<Image source={item} style={styles.carouselImage} />
								<View style={styles.carouselOverlay}>
									<Text style={styles.carouselText}>Corte #{index + 1}</Text>
								</View>
							</View>
						)}
					/>

					{/* INDICADORES DE PÁGINA */}
					<View style={styles.pagination}>
						{IMAGES.map((_, i) => {
							const inputRange = [width * (i - 1), width * i, width * (i + 1)];
							const dotWidth = scrollX.interpolate({
								inputRange,
								outputRange: [8, 16, 8],
								extrapolate: "clamp",
							});
							const opacity = scrollX.interpolate({
								inputRange,
								outputRange: [0.4, 1, 0.4],
								extrapolate: "clamp",
							});
							return (
								<Animated.View
									key={i}
									style={[styles.dot, { width: dotWidth, opacity }]}
								/>
							);
						})}
					</View>
				</View>

				{/* SECCIÓN: SERVICIOS */}
				<Text style={styles.sectionTitle}>Servicios</Text>
				<View style={styles.servicesGrid}>
					{[
						{ icon: "cut-outline", label: "Corte" },
						{ icon: "body-outline", label: "Paquete completo" },
						{ icon: "sparkles-outline", label: "Ceja" },
						{ icon: "man-outline", label: "Barba" },
					].map((service, index) => (
						<TouchableOpacity
							key={index}
							activeOpacity={0.7}
							onPress={() => console.log(`Presionaste ${service.label}`)}
							style={[
								styles.serviceCard,
								{
									backgroundColor: isDark
										? theme.colors.secondary
										: theme.colors.surface,
									borderColor: isDark ? "#C0A06050" : "#C0A06080",
								},
							]}
						>
							<Ionicons
								name={service.icon}
								size={28}
								color={isDark ? theme.colors.accent : theme.colors.blueBarber}
							/>
							<Text style={styles.serviceText}>{service.label}</Text>
						</TouchableOpacity>
					))}
				</View>

				{/* BOTONES PRINCIPALES */}
				<View style={styles.mainButtons}>
					<TouchableOpacity
						activeOpacity={0.7}
						style={[
							styles.mainButtonCard,
							{ backgroundColor: theme.colors.button2 },
						]}
						onPress={() => navigation.navigate("Booking")}
					>
						<Ionicons name="calendar-outline" size={38} color="#fff" />
						<Text style={styles.mainButtonText}>Reservar cita</Text>
					</TouchableOpacity>

					<TouchableOpacity
						activeOpacity={0.7}
						style={[
							styles.mainButtonCard,
							{ backgroundColor: theme.colors.button1 },
						]}
						onPress={() => navigation.navigate("Appointments")}
					>
						<Ionicons name="time-outline" size={38} color="#fff" />
						<Text style={styles.mainButtonText}>Mis citas</Text>
					</TouchableOpacity>
				</View>
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
			marginLeft: 20,
			marginBottom: 12,
		},
		promoCard: {
			backgroundColor: isDark ? theme.colors.secondary : theme.colors.secondary,
			borderRadius: 16,
			flexDirection: "row",
			justifyContent: "space-between",
			alignItems: "center",
			padding: 16,
			marginHorizontal: 20,
			marginBottom: 25,
			elevation: 3,
		},
		promoTextContainer: { flex: 1, marginRight: 10 },
		promoTitle: { color: "#fff", fontSize: 18, fontWeight: "700" },
		promoSubtitle: { color: "#f3f1f3", fontSize: 14, marginBottom: 10 },
		promoButton: {
			backgroundColor: "#C0A060",
			paddingVertical: 8,
			paddingHorizontal: 14,
			borderRadius: 8,
		},
		promoButtonText: { color: "#fff", fontWeight: "700", fontSize: 13 },
		promoImage: { width: 80, height: 80, borderRadius: 50 },

		carouselCard: {
			width: width,
			height: 260,
			borderRadius: 12,
			overflow: "hidden",
			elevation: 4,
			backgroundColor: theme.colors.surface,
			shadowColor: "#000",
			shadowOffset: { width: 0, height: 3 },
			shadowOpacity: 0.3,
			shadowRadius: 4.8,
		},
		carouselImage: { width: "100%", height: "100%", resizeMode: "cover" },
		carouselOverlay: {
			position: "absolute",
			bottom: 0,
			width: "100%",
			backgroundColor: "rgba(0, 0, 0, 0.45)",
			paddingVertical: 10,
			alignItems: "center",
		},
		carouselText: { color: "#fff", fontWeight: "600", fontSize: 16 },

		pagination: {
			flexDirection: "row",
			justifyContent: "center",
			alignItems: "center",
			marginTop: 12,
			marginBottom: 25,
		},
		dot: {
			height: 8,
			borderRadius: 4,
			backgroundColor: "#C0A060",
			marginHorizontal: 4,
		},

		servicesGrid: {
			flexDirection: "row",
			flexWrap: "wrap",
			justifyContent: "space-between",
			rowGap: 20,
			columnGap: 14,
			marginHorizontal: 20,
			marginBottom: 30,
		},
		serviceCard: {
			alignItems: "center",
			justifyContent: "center",
			width: 90,
			height: 90,
			borderRadius: 45,
			borderWidth: 2,
			elevation: 3,
			shadowColor: "#000",
			shadowOffset: { width: 0, height: 3 },
			shadowOpacity: 0.2,
			shadowRadius: 3.8,
		},
		serviceText: {
			marginTop: 6,
			fontSize: 12.5,
			color: theme.colors.text,
			fontWeight: "500",
			textAlign: "center",
		},
		mainButtons: {
			flexDirection: "row",
			justifyContent: "space-around",
			marginTop: 25,
			gap: 20,
			marginHorizontal: 20,
		},
		mainButtonCard: {
			flex: 1,
			alignItems: "center",
			justifyContent: "center",
			paddingVertical: 28,
			borderRadius: 18,
			elevation: 4,
			gap: 8,
			borderWidth: 2,
			borderColor: "#C0A060",
			shadowColor: "#000",
			shadowOffset: { width: 0, height: 4 },
			shadowOpacity: 0.3,
			shadowRadius: 4.65,
		},
		mainButtonText: {
			color: "#fff",
			fontWeight: "600",
			fontSize: 15,
			marginTop: 6,
			textAlign: "center",
			letterSpacing: 0.4,
		},
	});
