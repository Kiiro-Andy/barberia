import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  Platform,
} from "react-native";
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../Theme/ThemeContext";
import { supabase } from "../utils/supabase";

const STEPS = ["barber", "service", "date", "time", "confirm", "done"];

export default function BookingScreen({ navigation }) {
  const { theme } = useTheme();
  const styles = makeStyles(theme);

  const BARBERS = [
    { id: 1, name: "Carlos", specialty: "Fades y barba pro" },
    { id: 2, name: "Luis", specialty: "Corte clásico a tijera" },
    { id: 3, name: "Edweed", specialty: "Degradado HD 🤌" },
  ];

  const SERVICES = [
    { id: "corte", name: "Corte", emoji: "💇‍♂️" },
    { id: "barba", name: "Barba", emoji: "🧔" },
    { id: "ceja", name: "Ceja", emoji: "👁️" },
  ];

  const BASE_TIMES = ["10:00", "11:00", "12:00", "16:00", "17:00", "18:30"];

  const [step, setStep] = useState("barber");
  const [history, setHistory] = useState([]);
  const [selectedBarber, setSelectedBarber] = useState(null);
  const [selectedServices, setSelectedServices] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedTime, setSelectedTime] = useState(null);
  const [timeSlots, setTimeSlots] = useState([]);
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
      }
    };
    getUser();
  }, []);

  const buildTimeSlots = () =>
    BASE_TIMES.map((t) => ({
      time: t,
      available: Math.random() > 0.35,
    }));

  const goTo = (next) => {
    setHistory((h) => [...h, step]);
    setStep(next);
  };

  const goBack = () => {
    setHistory((h) => {
      const prev = h[h.length - 1];
      setStep(prev || "barber");
      return h.slice(0, -1);
    });
  };

  const handleReset = () => {
    setStep("barber");
    setHistory([]);
    setSelectedBarber(null);
    setSelectedServices([]);
    setSelectedDate(new Date());
    setSelectedTime(null);
    setTimeSlots([]);
  };

  const servicesLabel = selectedServices.map((s) => s.name).join(" + ") || null;

  const saveAppointment = async () => {
    if (!userId) {
      Alert.alert("Error", "Debes iniciar sesión para agendar una cita");
      return false;
    }

    setLoading(true);
    try {
      // Formatear fecha como YYYY-MM-DD
      const formattedDate = selectedDate.toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('appointments')
        .insert([
          {
            user_id: userId,
            barber_name: selectedBarber.name,
            services: selectedServices.map(s => s.name).join(', '),
            fecha: formattedDate,
            time: selectedTime,
            status: 'confirmed'
          }
        ])
        .select();

      if (error) {
        console.error('Error al guardar la cita:', error);
        Alert.alert("Error", "No se pudo guardar la cita. Intenta de nuevo.");
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error:', error);
      Alert.alert("Error", "Ocurrió un error inesperado");
      return false;
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- UI helpers ---------------- */

  const StepIndicator = () => {
    const currentIndex = STEPS.indexOf(step);
    return (
      <View style={styles.stepRow}>
        {STEPS.slice(0, -1).map((_, i) => (
          <View
            key={i}
            style={[
              styles.stepDot,
              i <= currentIndex && { backgroundColor: theme.colors.accent },
            ]}
          />
        ))}
      </View>
    );
  };

  const MiniSummary = () => {
    const dateStr = selectedDate ? selectedDate.toLocaleDateString('es-MX', { 
      weekday: 'short', 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    }) : null;
    
    return (
      <View style={styles.miniSummary}>
        {selectedBarber && <Chip icon="person" text={selectedBarber.name} />}
        {servicesLabel && <Chip icon="sparkles" text={servicesLabel} />}
        {dateStr && <Chip icon="calendar" text={dateStr} />}
        {selectedTime && <Chip icon="time" text={selectedTime} />}
      </View>
    );
  };

  const Chip = ({ icon, text }) => (
    <View style={styles.chip}>
      <Ionicons
        name={`${icon}-outline`}
        size={14}
        color={theme.colors.primary}
      />
      <Text style={styles.chipText}>{text}</Text>
    </View>
  );

  const Receipt = ({ title, footerText, highlight }) => {
    const dateStr = selectedDate ? selectedDate.toLocaleDateString('es-MX', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    }) : null;
    
    return (
      <View style={[styles.receipt, highlight && styles.receiptHighlight]}>
        <Text style={styles.receiptTitle}>{title}</Text>

        <View style={styles.receiptLine} />

        {selectedBarber && (
          <View style={styles.receiptRow}>
            <Text style={styles.receiptLabel}>Barbero</Text>
            <Text style={styles.receiptValue}>{selectedBarber.name}</Text>
          </View>
        )}

        {servicesLabel && (
          <View style={styles.receiptRow}>
            <Text style={styles.receiptLabel}>Servicios</Text>
            <Text style={styles.receiptValue}>{servicesLabel}</Text>
          </View>
        )}

        {dateStr && (
          <View style={styles.receiptRow}>
            <Text style={styles.receiptLabel}>Fecha</Text>
            <Text style={styles.receiptValue}>{dateStr}</Text>
          </View>
        )}

        {selectedTime && (
          <View style={styles.receiptRow}>
            <Text style={styles.receiptLabel}>Hora</Text>
            <Text style={styles.receiptValue}>{selectedTime}</Text>
          </View>
        )}

      <View style={styles.receiptLineDashed} />

      {footerText && <Text style={styles.receiptFooter}>{footerText}</Text>}
    </View>
  );

  const Header = ({ icon, title, subtitle, hideSummary }) => (
    <>
      <StepIndicator />
      <View style={{ alignItems: "center", marginBottom: 16 }}>
        <Ionicons name={icon} size={28} color={theme.colors.accent} />
        <Text style={styles.title}>{title}</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>
      {!hideSummary && <MiniSummary />}
    </>
  );

  /* ---------------- Steps ---------------- */

  const StepBarber = () => (
    <>
      <Header icon="person-outline" title="Elige tu barbero" />
      {BARBERS.map((b) => (
        <TouchableOpacity
          key={b.id}
          style={styles.cardOption}
          onPress={() => {
            setSelectedBarber(b);
            goTo("service");
          }}
        >
          <View>
            <Text style={styles.optionTitle}>{b.name}</Text>
            <Text style={styles.optionSubtitle}>{b.specialty}</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} />
        </TouchableOpacity>
      ))}
    </>
  );

  const StepService = () => (
    <>
      <Header icon="sparkles-outline" title="Servicios" />
      {SERVICES.map((s) => {
        const active = selectedServices.find((x) => x.id === s.id);
        return (
          <TouchableOpacity
            key={s.id}
            style={[
              styles.cardOption,
              active && { borderColor: theme.colors.accent },
            ]}
            onPress={() =>
              setSelectedServices((prev) =>
                active ? prev.filter((x) => x.id !== s.id) : [...prev, s],
              )
            }
          >
            <Text style={styles.optionTitle}>
              {s.name} {s.emoji}
            </Text>
            <Ionicons
              name={active ? "checkmark-circle" : "ellipse-outline"}
              size={20}
              color={theme.colors.accent}
            />
          </TouchableOpacity>
        );
      })}
      <TouchableOpacity
        style={styles.mainButton}
        disabled={!selectedServices.length}
        onPress={() => goTo("date")}
      >
        <Text style={styles.mainButtonText}>Continuar</Text>
      </TouchableOpacity>
    </>
  );

  const StepDay = () => {
    const today = new Date();
    const minDate = today;
    const maxDate = new Date(today.getFullYear(), today.getMonth() + 3, today.getDate());

    const onDateChange = (event, date) => {
      setShowDatePicker(Platform.OS === 'ios');
      if (date) {
        setSelectedDate(date);
        if (Platform.OS === 'android') {
          setTimeSlots(buildTimeSlots());
          goTo("time");
        }
      }
    };

    return (
      <>
        <Header icon="calendar-outline" title="Selecciona la fecha" />
        
        <View style={styles.dateContainer}>
          <Text style={styles.dateLabel}>Fecha seleccionada:</Text>
          <Text style={styles.dateValue}>
            {selectedDate.toLocaleDateString('es-MX', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.cardOption}
          onPress={() => setShowDatePicker(true)}
        >
          <Text style={styles.optionTitle}>📅 Cambiar fecha</Text>
          <Ionicons name="chevron-forward" size={18} color={theme.colors.text} />
        </TouchableOpacity>

        {showDatePicker && (
          <DateTimePicker
            value={selectedDate}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={onDateChange}
            minimumDate={minDate}
            maximumDate={maxDate}
            locale="es-MX"
          />
        )}

        {Platform.OS === 'ios' && (
          <TouchableOpacity
            style={styles.mainButton}
            onPress={() => {
              setShowDatePicker(false);
              setTimeSlots(buildTimeSlots());
              goTo("time");
            }}
          >
            <Text style={styles.mainButtonText}>Continuar</Text>
          </TouchableOpacity>
        )}
      </>
    );
  };

  const StepTime = () => (
    <>
      <Header icon="time-outline" title="Selecciona la hora" />
      <View style={styles.timeGrid}>
        {timeSlots.map((t) => (
          <TouchableOpacity
            key={t.time}
            disabled={!t.available}
            style={[styles.timeChip, !t.available && { opacity: 0.4 }]}
            onPress={() => {
              setSelectedTime(t.time);
              goTo("confirm");
            }}
          >
            <Text style={styles.timeText}>{t.time}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </>
  );

  const StepConfirm = () => {
    const handleConfirm = async () => {
      const success = await saveAppointment();
      if (success) {
        goTo("done");
      }
    };

    return (
      <>
        <Header
          icon="checkmark-done-outline"
          title="Confirmar cita"
          hideSummary
        />

        <Receipt title="Resumen de tu cita" footerText="Confirma tu cita" />

        <TouchableOpacity 
          style={[styles.mainButton, loading && { opacity: 0.6 }]} 
          onPress={handleConfirm}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={theme.colors.primary} />
          ) : (
            <Text style={styles.mainButtonText}>Confirmar</Text>
          )}
        </TouchableOpacity>
      </>
    );
  };

  const StepDone = () => (
    <>
      <Header icon="ribbon-outline" title="¡Cita agendada!" hideSummary />

      <Receipt
        title="Comprobante de cita"
        footerText="Gracias por tu preferencia ✨"
        highlight
      />

      <TouchableOpacity
        style={styles.mainButton}
        onPress={() => navigation.navigate("Home")}
      >
        <Text style={styles.mainButtonText}>Volver al inicio</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={handleReset}>
        <Text style={styles.resetText}>Hacer otra cita</Text>
      </TouchableOpacity>
    </>
  );

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.container}>
        {
          {
            barber: <StepBarber />,
            service: <StepService />,
            date: <StepDay />,
            time: <StepTime />,
            confirm: <StepConfirm />,
            done: <StepDone />,
          }[step]
        }

        {step !== "barber" && step !== "done" && (
          <TouchableOpacity onPress={goBack}>
            <Text style={styles.backText}>← Atrás</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
}

/* ---------------- Styles ---------------- */

const makeStyles = (theme) =>
  StyleSheet.create({
    screen: { flex: 1, backgroundColor: theme.colors.background },
    container: { padding: 24, paddingTop: 60 },

    stepRow: {
      flexDirection: "row",
      justifyContent: "center",
      marginBottom: 12,
    },
    stepDot: {
      width: 10,
      height: 10,
      borderRadius: 5,
      backgroundColor: theme.colors.border,
      marginHorizontal: 4,
    },

    title: {
      fontSize: 26,
      fontWeight: "700",
      color: theme.colors.accent,
      marginTop: 8,
    },
    subtitle: {
      color: theme.colors.subtext,
      fontSize: 14,
      marginTop: 4,
    },

    miniSummary: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "center",
      marginBottom: 16,
    },
    chip: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: theme.colors.card,
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 20,
      margin: 4,
    },
    chipText: {
      marginLeft: 6,
      color: theme.colors.text,
      fontSize: 13,
    },

    cardOption: {
      backgroundColor: theme.colors.card,
      padding: 16,
      borderRadius: 12,
      marginBottom: 10,
      borderWidth: 1,
      borderColor: theme.colors.border,
      flexDirection: "row",
      justifyContent: "space-between",
    },

    optionTitle: {
      fontSize: 16,
      fontWeight: "600",
      color: theme.colors.text,
    },
    optionSubtitle: {
      fontSize: 13,
      color: theme.colors.subtext,
    },

    timeGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "space-between",
    },
    timeChip: {
      width: "48%",
      backgroundColor: theme.colors.card,
      padding: 14,
      borderRadius: 10,
      marginBottom: 10,
      alignItems: "center",
    },
    timeText: { 
      fontSize: 16, 
      fontWeight: "600", 
      color: theme.colors.text,
    },

    mainButton: {
      backgroundColor: theme.colors.accent,
      padding: 14,
      borderRadius: 10,
      alignItems: "center",
      marginTop: 12,
    },
    mainButtonText: {
      color: theme.colors.primary,
      fontSize: 16,
      fontWeight: "700",
    },

    dateContainer: {
      backgroundColor: theme.colors.card,
      padding: 16,
      borderRadius: 12,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: theme.colors.border,
      alignItems: "center",
    },
    dateLabel: {
      fontSize: 14,
      color: theme.colors.subtext,
      marginBottom: 8,
    },
    dateValue: {
      fontSize: 18,
      fontWeight: "600",
      color: theme.colors.accent,
      textAlign: "center",
      textTransform: "capitalize",
    },

    backText: {
      textAlign: "center",
      marginTop: 16,
      color: theme.colors.accent,
      fontWeight: "600",
    },
    resetText: {
      textAlign: "center",
      marginTop: 14,
      color: theme.colors.accent,
    },
    receipt: {
      backgroundColor: theme.colors.card,
      borderRadius: 16,
      padding: 20,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    receiptTitle: {
      fontSize: 18,
      fontWeight: "700",
      textAlign: "center",
      color: theme.colors.accent,
      marginBottom: 12,
    },
    receiptRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginVertical: 6,
    },
    receiptLabel: {
      color: theme.colors.subtext,
      fontSize: 14,
    },
    receiptValue: {
      color: theme.colors.text,
      fontWeight: "600",
    },
    receiptLine: {
      height: 1,
      backgroundColor: theme.colors.border,
      marginBottom: 10,
    },
    receiptLineDashed: {
      height: 1,
      borderStyle: "dashed",
      borderWidth: 1,
      borderColor: theme.colors.border,
      marginVertical: 12,
    },
    receiptFooter: {
      textAlign: "center",
      fontSize: 12,
      color: theme.colors.subtext,
    },
    receiptHighlight: {
      borderColor: "#C0A060", // dorado elegante
      borderWidth: 2,
      shadowColor: "#C0A060",
      shadowOpacity: 0.25,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 4 },
      elevation: 6,
    },
  });
