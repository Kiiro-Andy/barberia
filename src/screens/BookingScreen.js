import React, { useState } from "react";
import {
	View,
	Text,
	TouchableOpacity,
	StyleSheet,
	ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../Theme/ThemeContext";

export default function BookingScreen({ navigation }) {
	const { theme } = useTheme(); // sin toggle ni switch
	const styles = makeStyles(theme);

	// ----- DATA MOCK -----
	const BARBERS = [
		{ id: 1, name: "Carlos", specialty: "Fades y barba pro" },
		{ id: 2, name: "Luis", specialty: "Corte clásico a tijera" },
		{ id: 3, name: "Edweed", specialty: "Degradado HD 🤌" },
	];

	const SERVICES = [
		{ id: "corte", name: "Corte", emoji: "💇‍♂️" },
		{ id: "barba", name: "Barba", emoji: "🧔" },
		{ id: "ceja", name: "Ceja", emoji: "👁️" },
		{ id: "full", name: "Paquete completo", emoji: "✨" },
	];

	const DAYS = [
		"Lunes",
		"Martes",
		"Miércoles",
		"Jueves",
		"Viernes",
		"Sábado",
		"Domingo",
	];
	const BASE_TIMES = ["10:00", "11:00", "12:00", "16:00", "17:00", "18:30"];

	// ----- STATE -----
	// flujo: barber -> service -> date -> time -> confirm -> done
	const [step, setStep] = useState("barber");
	const [selectedBarber, setSelectedBarber] = useState(null);
	const [selectedService, setSelectedService] = useState(null);
	const [selectedDay, setSelectedDay] = useState(null);
	const [selectedTime, setSelectedTime] = useState(null);
	const [timeSlots, setTimeSlots] = useState([]);

	// disponibilidad fake
	function buildTimeSlots() {
		return BASE_TIMES.map((t) => ({
			time: t,
			available: Math.random() > 0.35,
		}));
	}

	// ----- HANDLERS -----
	function handleSelectBarber(barber) {
		setSelectedBarber(barber);
		setStep("service");
	}

	function handleSelectService(service) {
		setSelectedService(service);
		setStep("date");
	}

	function handleSelectDay(day) {
		setSelectedDay(day);
		setTimeSlots(buildTimeSlots());
		setSelectedTime(null);
		setStep("time");
	}

	function handleSelectTime(slot) {
		if (!slot.available) return;
		setSelectedTime(slot.time);
		setStep("confirm");
	}

	function handleConfirm() {
		setStep("done");
	}

	function handleReset() {
		setStep("barber");
		setSelectedBarber(null);
		setSelectedService(null);
		setSelectedDay(null);
		setSelectedTime(null);
		setTimeSlots([]);
	}

	// ----- UI HELPERS -----
	const Header = ({ icon, title, subtitle }) => (
		<View style={{ alignItems: "center", marginBottom: 20 }}>
			<Ionicons name={icon} size={28} color={theme.colors.accent} />
			<Text style={styles.title}>{title}</Text>
			{subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
		</View>
	);

	// Paso 1: Barbero
	const StepBarber = () => (
		<>
			<Header
				icon="person-outline"
				title="Elige tu barbero 💈"
				subtitle="Estos son los barberos disponibles ahora mismo:"
			/>
			{BARBERS.map((b) => (
				<TouchableOpacity
					key={b.id}
					style={styles.cardOption}
					onPress={() => handleSelectBarber(b)}
				>
					<View style={{ flexDirection: "row", alignItems: "center" }}>
						<Ionicons
							name="cut-outline"
							size={22}
							color={theme.colors.primary}
							style={{ marginRight: 8 }}
						/>
						<View>
							<Text style={styles.optionTitle}>{b.name}</Text>
							<Text style={styles.optionSubtitle}>{b.specialty}</Text>
						</View>
					</View>
					<Ionicons
						name="chevron-forward"
						size={20}
						color={theme.colors.subtext}
					/>
				</TouchableOpacity>
			))}
		</>
	);

	// Paso 2: Servicio
	const StepService = () => (
		<>
			<Header
				icon="sparkles-outline"
				title="¿Qué servicio necesitas?"
				subtitle={`Barbero: ${selectedBarber?.name}`}
			/>
			{SERVICES.map((s) => (
				<TouchableOpacity
					key={s.id}
					style={styles.cardOption}
					onPress={() => handleSelectService(s)}
				>
					<View style={{ flexDirection: "row", alignItems: "center" }}>
						<Ionicons
							name="pricetag-outline"
							size={22}
							color={theme.colors.primary}
							style={{ marginRight: 8 }}
						/>
						<Text style={styles.optionTitle}>
							{s.name} {s.emoji}
						</Text>
					</View>
					<Ionicons
						name="chevron-forward"
						size={20}
						color={theme.colors.subtext}
					/>
				</TouchableOpacity>
			))}
		</>
	);

	// Paso 3: Día
	const StepDay = () => (
		<>
			<Header
				icon="calendar-outline"
				title="Selecciona el día 📅"
				subtitle={`${selectedBarber?.name} • ${selectedService?.name}`}
			/>
			{DAYS.map((day, idx) => (
				<TouchableOpacity
					key={idx}
					style={[
						styles.cardOption,
						selectedDay === day && { borderColor: theme.colors.accent },
					]}
					onPress={() => handleSelectDay(day)}
				>
					<View style={{ flexDirection: "row", alignItems: "center" }}>
						<Ionicons
							name="today-outline"
							size={22}
							color={theme.colors.primary}
							style={{ marginRight: 8 }}
						/>
						<Text style={styles.optionTitle}>{day}</Text>
					</View>
					<Ionicons
						name="time-outline"
						size={20}
						color={theme.colors.subtext}
					/>
				</TouchableOpacity>
			))}
		</>
	);

	// Paso 4: Hora
	const StepTime = () => (
		<>
			<Header
				icon="time-outline"
				title="Selecciona la hora ⏰"
				subtitle={`${selectedBarber?.name} • ${selectedService?.name} • ${selectedDay}`}
			/>
			{timeSlots.map((slot, idx) => (
				<TouchableOpacity
					key={idx}
					style={[
						styles.timeButton,
						!slot.available && styles.timeButtonDisabled,
					]}
					onPress={() => handleSelectTime(slot)}
					disabled={!slot.available}
				>
					<View style={{ flexDirection: "row", alignItems: "center" }}>
						<Ionicons
							name={slot.available ? "checkmark-circle" : "close-circle"}
							size={20}
							color={
								slot.available ? theme.colors.primary : theme.colors.subtext
							}
							style={{ marginRight: 8 }}
						/>
						<Text
							style={[
								styles.timeText,
								!slot.available && styles.timeTextDisabled,
							]}
						>
							{slot.time}
						</Text>
					</View>
					<Text
						style={[
							styles.timeStatus,
							!slot.available && styles.timeStatusDisabled,
						]}
					>
						{slot.available ? "Disponible" : "Ocupado"}
					</Text>
				</TouchableOpacity>
			))}
		</>
	);

	// Paso 5: Confirmar
	const StepConfirm = () => (
		<>
			<Header
				icon="checkmark-done-outline"
				title="Confirmar cita ✅"
				subtitle="Revisa los datos antes de agendar"
			/>
			<View style={styles.summaryBox}>
				<RowInfo
					icon="person-outline"
					label="Barbero"
					value={selectedBarber?.name}
					theme={theme}
				/>
				<RowInfo
					icon="sparkles-outline"
					label="Servicio"
					value={selectedService?.name}
					theme={theme}
				/>
				<RowInfo
					icon="calendar-outline"
					label="Día"
					value={selectedDay}
					theme={theme}
				/>
				<RowInfo
					icon="time-outline"
					label="Hora"
					value={selectedTime}
					theme={theme}
				/>
			</View>
			<TouchableOpacity style={styles.mainButton} onPress={handleConfirm}>
				<Text style={styles.mainButtonText}>Confirmar cita</Text>
			</TouchableOpacity>
		</>
	);

	// Paso 6: Listo
	const StepDone = () => (
		<>
			<Header
				icon="ribbon-outline"
				title="Cita agendada 🎉"
				subtitle="Tu reservación ha sido creada exitosamente."
			/>
			<View style={styles.summaryBox}>
				<RowInfo
					icon="person-outline"
					label="Barbero"
					value={selectedBarber?.name}
					theme={theme}
				/>
				<RowInfo
					icon="sparkles-outline"
					label="Servicio"
					value={selectedService?.name}
					theme={theme}
				/>
				<RowInfo
					icon="calendar-outline"
					label="Día"
					value={selectedDay}
					theme={theme}
				/>
				<RowInfo
					icon="time-outline"
					label="Hora"
					value={selectedTime}
					theme={theme}
				/>
			</View>
			<TouchableOpacity
				style={styles.mainButton}
				onPress={() => navigation.navigate("Home")}
			>
				<Text style={styles.mainButtonText}>Volver al inicio</Text>
			</TouchableOpacity>
			<TouchableOpacity style={styles.resetBtn} onPress={handleReset}>
				<Text style={styles.resetText}>Hacer otra cita</Text>
			</TouchableOpacity>
		</>
	);

	return (
		<View style={styles.screen}>
			<ScrollView
				contentContainerStyle={styles.container}
				showsVerticalScrollIndicator={false}
			>
				{step === "barber" && <StepBarber />}
				{step === "service" && <StepService />}
				{step === "date" && <StepDay />}
				{step === "time" && <StepTime />}
				{step === "confirm" && <StepConfirm />}
				{step === "done" && <StepDone />}

				{step !== "barber" && step !== "done" && (
					<TouchableOpacity style={styles.backButton} onPress={handleReset}>
						<Text style={styles.backText}>← Empezar otra vez</Text>
					</TouchableOpacity>
				)}
			</ScrollView>
		</View>
	);
}

function RowInfo({ icon, label, value, theme }) {
	return (
		<View style={{ flexDirection: "row", marginBottom: 8 }}>
			<Ionicons
				name={icon}
				size={18}
				color={theme.colors.accent}
				style={{ marginRight: 6, marginTop: 2 }}
			/>
			<Text
				style={{
					color: theme.colors.text,
					fontSize: 15,
					fontWeight: "500",
					marginRight: 4,
				}}
			>
				{label}:
			</Text>
			<Text style={{ color: theme.colors.subtext, fontSize: 15 }}>{value}</Text>
		</View>
	);
}

const makeStyles = (theme) =>
	StyleSheet.create({
		screen: { flex: 1, backgroundColor: theme.colors.background },
		container: {
			paddingTop: 80,
			paddingBottom: 40,
			paddingHorizontal: 24,
			alignItems: "stretch",
		},
		title: {
			fontSize: 26,
			fontWeight: "700",
			color: theme.colors.accent,
			marginBottom: 8,
			marginTop: 12,
			textAlign: "center",
		},
		subtitle: {
			color: theme.colors.subtext,
			fontSize: 14,
			marginBottom: 20,
			textAlign: "center",
		},

		cardOption: {
			backgroundColor: theme.colors.card,
			borderRadius: 12,
			paddingVertical: 16,
			paddingHorizontal: 16,
			borderWidth: 1,
			borderColor: theme.colors.border,
			marginBottom: 10,
			flexDirection: "row",
			alignItems: "center",
			justifyContent: "space-between",
		},
		optionTitle: { color: theme.colors.text, fontSize: 16, fontWeight: "600" },
		optionSubtitle: { color: theme.colors.subtext, fontSize: 13 },

		timeButton: {
			backgroundColor: theme.colors.card,
			borderRadius: 10,
			paddingVertical: 14,
			paddingHorizontal: 16,
			borderWidth: 1,
			borderColor: theme.colors.accent,
			marginBottom: 10,
			flexDirection: "row",
			alignItems: "center",
			justifyContent: "space-between",
		},
		timeButtonDisabled: { opacity: 0.5, borderColor: theme.colors.border },
		timeText: { color: theme.colors.text, fontSize: 16, fontWeight: "600" },
		timeTextDisabled: { color: theme.colors.subtext },
		timeStatus: { color: theme.colors.primary, fontWeight: "500" },
		timeStatusDisabled: { color: theme.colors.subtext },

		summaryBox: {
			backgroundColor: theme.colors.card,
			borderRadius: 12,
			padding: 16,
			borderWidth: 1,
			borderColor: theme.colors.border,
			marginBottom: 20,
		},

		mainButton: {
			backgroundColor: theme.colors.accent,
			borderRadius: 10,
			paddingVertical: 14,
			alignItems: "center",
			width: "100%",
			marginBottom: 16,
		},
		mainButtonText: {
			color: theme.colors.primary,
			fontWeight: "700",
			fontSize: 16,
		},

		backButton: { alignSelf: "center", marginTop: 10 },
		backText: { color: theme.colors.accent, fontWeight: "600", fontSize: 14 },

		resetBtn: { alignSelf: "center", marginTop: 12 },
		resetText: { color: theme.colors.accent, fontWeight: "600", fontSize: 15 },
	});
