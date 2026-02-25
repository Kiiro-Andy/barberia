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
  const [services, setServices] = useState([]);
  const [occupiedTimes, setOccupiedTimes] = useState([]);
  const [availability, setAvailability] = useState(null);
  const [barbers, setBarbers] = useState([]);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
      }
    };
    getUser();

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

    const fetchBarbers = async () => {
      console.log('Fetching barbers...');
      const { data, error } = await supabase
        .from('profiles')
        .select('id, nombre, rol')
        .eq('rol', 'barbero')
        .order('nombre');

      console.log('Barbers query result:', { data, error });

      if (error) {
        console.error('Error fetching barbers:', error);
        Alert.alert('Error', 'No se pudieron cargar los barberos');
      } else if (data) {
        console.log('Setting barbers:', data);
        setBarbers(data);
      }
    };
    fetchBarbers();
  }, []);

const fetchAvailability = async (dateParam = null) => {
    // Usar la fecha proporcionada o el estado actual
    const targetDate = dateParam || selectedDate;
    
    // Domingo=0, Lunes=1, Martes=2, Miércoles=3, Jueves=4, Viernes=5, Sábado=6
    const dayOfWeek = targetDate.getDay();
    const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    
    console.log(`fetchAvailability - fecha: ${targetDate.toDateString()}, día: ${dayOfWeek} (${dayNames[dayOfWeek]})`);
    
    // Si es domingo (0), no hay atención
    if (dayOfWeek === 0) {
      setAvailability(null);
      return null;
    }
    
    // Consultar la tabla availability para este día de la semana
    const { data, error } = await supabase
      .from('availability')
      .select('dia_semana, hora_inicio, hora_fin')
      .eq('dia_semana', dayOfWeek)
      .single();
    
    console.log(`Consultando availability con dia_semana=${dayOfWeek}:`, data, error);
    
    if (data && !error) {
      setAvailability(data);
      return data;
    } else {
      console.log(`No se encontró disponibilidad para día ${dayOfWeek}, usando horarios por defecto`);
      // Si no hay disponibilidad configurada, usar horarios por defecto
      const defaultHours = {
        1: { dia_semana: 1, hora_inicio: '09:00', hora_fin: '19:00' }, // Lunes
        2: { dia_semana: 2, hora_inicio: '09:00', hora_fin: '19:00' }, // Martes
        3: { dia_semana: 3, hora_inicio: '09:00', hora_fin: '19:00' }, // Miércoles
        4: { dia_semana: 4, hora_inicio: '09:00', hora_fin: '19:00' }, // Jueves
        5: { dia_semana: 5, hora_inicio: '09:00', hora_fin: '19:00' }, // Viernes
        6: { dia_semana: 6, hora_inicio: '09:00', hora_fin: '15:00' }, // Sábado
      };
      
      const defaultAvail = defaultHours[dayOfWeek];
      if (defaultAvail) {
        setAvailability(defaultAvail);
        return defaultAvail;
      }
      
      setAvailability(null);
      return null;
    }
  };

  const generateTimeSlots = (startTime, endTime, occupied, selectedDateParam = null) => {
    if (!startTime || !endTime) return [];
    
    const slots = [];
    const [startHour, startMinute] = startTime.split(':').map(Number);
    const [endHour, endMinute] = endTime.split(':').map(Number);
    
    // Verificar si la fecha seleccionada es hoy
    const today = new Date();
    const isToday = selectedDateParam && 
      selectedDateParam.getDate() === today.getDate() &&
      selectedDateParam.getMonth() === today.getMonth() &&
      selectedDateParam.getFullYear() === today.getFullYear();
    
    // Obtener la hora actual si es hoy
    const currentHour = isToday ? today.getHours() : null;
    const currentMinute = isToday ? today.getMinutes() : null;
    
    console.log(`generateTimeSlots - es hoy: ${isToday}, hora actual: ${currentHour}:${currentMinute}`);
    
    // Generar horarios cada 30 minutos (9:00, 9:30, 10:00, 10:30, etc.)
    let hour = startHour;
    let minute = startMinute;
    
    while (hour < endHour || (hour === endHour && minute < endMinute)) {
      // Si es hoy, bloquear horas que ya pasaron
      let isPast = false;
      if (isToday) {
        if (hour < currentHour) {
          isPast = true;
        } else if (hour === currentHour && minute < currentMinute) {
          isPast = true;
        }
      }
      
      const time = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
      slots.push({
        time: time,
        available: !occupied.includes(time) && !isPast,
      });
      
      // Avanzar 30 minutos
      minute += 30;
      if (minute >= 60) {
        minute = 0;
        hour += 1;
      }
    }
    
    return slots;
  };

  const buildTimeSlots = async (onlyValidate = false) => {
    const formattedDate = selectedDate.toISOString().split('T')[0];
    console.log(`buildTimeSlots llamado - fecha: ${formattedDate}, onlyValidate: ${onlyValidate}`);
    
    // Consultar ocupados
    const { data: appointmentsData } = await supabase
      .from('appointments')
      .select('hora_inicio')
      .eq('fecha', formattedDate)
      .eq('status', 'confirmed');
    
    console.log(`Citas ocupadas para ${formattedDate}:`, appointmentsData);
    
    const occupiedTimes = appointmentsData?.map(a => a.hora_inicio) || [];
    
    // Obtener disponibilidad del día
    const avail = await fetchAvailability();
    
    console.log(`Disponibilidad obtenida:`, avail);
    
    if (!avail) {
      console.log(`No hay disponibilidad, slots vacíos`);
      setTimeSlots([]);
      return false;
    }
    
    const slots = generateTimeSlots(avail.hora_inicio, avail.hora_fin, occupiedTimes, selectedDate);
    console.log(`Slots generados:`, slots.length);
    setTimeSlots(slots);
    
    return true;
  };

  const fetchOccupiedTimes = async () => {
    const formattedDate = selectedDate.toISOString().split('T')[0];
    
    const { data, error } = await supabase
      .from('appointments')
      .select('hora_inicio')
      .eq('fecha', formattedDate)
      .eq('status', 'confirmed');
    
    if (data && !error) {
      const times = data.map(appointment => appointment.hora_inicio);
      setOccupiedTimes(times);
    }
  };

  // Función para verificar si el barbero tiene tiempo libre (vacaciones) en la fecha seleccionada
  const checkBarberTimeOff = async (barberId, dateParam) => {
    if (!barberId || !dateParam) return null;
    
    // Usar formato local YYYY-MM-DD en lugar de toISOString para evitar desfase de timezone
    const year = dateParam.getFullYear();
    const month = String(dateParam.getMonth() + 1).padStart(2, '0');
    const day = String(dateParam.getDate()).padStart(2, '0');
    const formattedDate = `${year}-${month}-${day}`;
    
    console.log(`checkBarberTimeOff - barberId: ${barberId}, fecha: ${formattedDate}`);
    
    const { data, error } = await supabase
      .from('time_off')
      .select('id, reason, date')
      .eq('barber_id', barberId)
      .eq('date', formattedDate)
      .single();
    
    console.log(`time_off query result:`, data, error);
    
    if (data && !error) {
      return data; // Retorna el registro de time_off con la razón
    }
    
    return null;
  };

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

  const servicesLabel = selectedServices.map((s) => s.nombre).join(" + ") || null;

const saveAppointment = async () => {
    if (!userId) {
      Alert.alert("Error", "Debes iniciar sesión para agendar una cita");
      return false;
    }

    if (!selectedServices.length) {
      Alert.alert("Error", "Selecciona al menos un servicio");
      return false;
    }

    setLoading(true);
    try {
      // Usar formato local YYYY-MM-DD en lugar de toISOString para evitar desfase de timezone
      const year = selectedDate.getFullYear();
      const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
      const day = String(selectedDate.getDate()).padStart(2, '0');
      const formattedDate = `${year}-${month}-${day}`;
      
      // Verificar que la hora no esté ocupada
      const { data: existingAppointments } = await supabase
        .from('appointments')
        .select('id')
        .eq('fecha', formattedDate)
        .eq('hora_inicio', selectedTime)
        .not('estado', 'eq', 'cancelada');
      
      if (existingAppointments && existingAppointments.length > 0) {
        Alert.alert(
          "Hora no disponible",
          "Ya existe una cita agendada a esta hora. Por favor selecciona otra hora.",
          [{ text: "Entendido" }]
        );
        setLoading(false);
        return false;
      }
      
      // Calcular hora_fin (una hora después de hora_inicio)
      const [hours, minutes] = selectedTime.split(':').map(Number);
      const endHour = hours + 1;
      const horaFin = `${String(endHour).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
      
      // Insertar cada servicio como una cita separada
      const appointmentsToInsert = selectedServices.map(service => ({
        user_id: userId,
        service_id: service.id,
        fecha: formattedDate,
        hora_inicio: selectedTime,
        hora_fin: horaFin,
        estado: 'pendiente',
        // Solo enviar barber_id si es un UUID válido, sino solo enviar el nombre
        ...(selectedBarber?.id && typeof selectedBarber.id === 'string' && selectedBarber.id.includes('-') 
          ? { barber_id: selectedBarber.id } 
          : {}),
        barber_name: selectedBarber?.nombre
      }));

      console.log('Insertando citas:', appointmentsToInsert);

      const { data, error } = await supabase
        .from('appointments')
        .insert(appointmentsToInsert)
        .select();

      if (error) {
        console.error('Error al guardar la cita:', error);
        Alert.alert("Error", `No se pudo guardar la cita: ${error.message}`);
        return false;
      }

      console.log('Citas guardadas exitosamente:', data);
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
        {selectedBarber && <Chip icon="person" text={selectedBarber.nombre} />}
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
            <Text style={styles.receiptValue}>{selectedBarber.nombre}</Text>
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
  };

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
      {barbers.map((b) => (
        <TouchableOpacity
          key={b.id}
          style={styles.cardOption}
          onPress={() => {
            setSelectedBarber(b);
            goTo("service");
          }}
        >
          <View>
            <Text style={styles.optionTitle}>{b.nombre}</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} />
        </TouchableOpacity>
      ))}
    </>
  );

  const StepService = () => (
    <>
      <Header icon="sparkles-outline" title="Servicios" />
      {services.map((s) => {
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
            <View>
              <Text style={styles.optionTitle}>
                {s.nombre}
              </Text>
              <Text style={styles.optionSubtitle}>
                {s.precio}
              </Text>
            </View>
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

// Función para construir slots con la fecha pasada como parámetro
    const handleBuildTimeSlots = async (dateParam) => {
      const targetDate = dateParam || selectedDate;
      const formattedDate = targetDate.toISOString().split('T')[0];
      console.log(`handleBuildTimeSlots - fecha: ${formattedDate}`);
      
      // Consultar citas ocupadas para este día (cualquier estado excepto cancelado)
      const { data: appointmentsData } = await supabase
        .from('appointments')
        .select('hora_inicio')
        .eq('fecha', formattedDate);
      
      // Normalizar horas ocupadas (quitar segundos si existen)
      const occupiedTimes = (appointmentsData || [])
        .filter(a => a.estado !== 'cancelada' && a.estado !== 'cancelled' && a.status !== 'cancelled')
        .map(a => {
          // Normalizar: "10:00:00" -> "10:00"
          const hora = a.hora_inicio || '';
          const parts = hora.split(':');
          return `${parts[0]}:${parts[1]}`;
        });
      
      console.log(`Citas ocupadas para ${formattedDate}:`, occupiedTimes);
      
      // Verificar si el barbero tiene tiempo libre (vacaciones) en esta fecha
      if (selectedBarber?.id) {
        const timeOff = await checkBarberTimeOff(selectedBarber.id, targetDate);
        if (timeOff) {
          console.log(`Barbero en tiempo libre: ${timeOff.reason}`);
          setTimeSlots([]);
          return { blocked: true, reason: timeOff.reason };
        }
      }
      
      // Pasar la fecha directamente a fetchAvailability
      const avail = await fetchAvailability(targetDate);
      
      if (!avail) {
        setTimeSlots([]);
        return false;
      }
      
      const slots = generateTimeSlots(avail.hora_inicio, avail.hora_fin, occupiedTimes, targetDate);
      console.log(`Slots generados: ${slots.length}, disponibles: ${slots.filter(s => s.available).length}`);
      setTimeSlots(slots);
      return true;
    };

    const onDateChange = async (event, date) => {
      console.log(`onDateChange llamado - event.type: ${event?.type}, date: ${date}`);
      
      setShowDatePicker(Platform.OS === 'ios');
      
      // En Android, cuando se confirma la fecha, event.type === 'set'
      let selectedDateObj = date;
      
      if (Platform.OS === 'android') {
        if (event.type === 'set' && date) {
          selectedDateObj = new Date(date);
          console.log(`Android fecha: ${selectedDateObj.toDateString()}, getDay(): ${selectedDateObj.getDay()}`);
        } else {
          console.log('Usuario canceló');
          return;
        }
      } else {
        console.log(`iOS date: ${date}`);
      }
      
      if (selectedDateObj) {
        console.log(`Fecha seleccionada: ${selectedDateObj.toDateString()}`);
        
        // Validar que no sea domingo
        const dayOfWeek = selectedDateObj.getDay();
        if (dayOfWeek === 0) {
          Alert.alert(
            "Día no disponible",
            "Los domingos no laboramos. Por favor selecciona un día de Lunes a Sábado.",
            [{ text: "Entendido", onPress: () => setSelectedDate(today) }]
          );
          return;
        }
        
        // Actualizar fecha Y llamar con la nueva fecha directamente
        setSelectedDate(selectedDateObj);
        
        // Verificar time off antes de proceder
        if (selectedBarber?.id) {
          const timeOff = await checkBarberTimeOff(selectedBarber.id, selectedDateObj);
          if (timeOff) {
            Alert.alert(
              "Día no disponible",
              `El barbero no estará disponible este día.\n\nRazón: ${timeOff.reason}`,
              [{ text: "Entendido" }]
            );
            return;
          }
        }
        
        await handleBuildTimeSlots(selectedDateObj);
        goTo("time");
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
            onPress={async () => {
              const dayOfWeek = selectedDate.getDay();
              if (dayOfWeek === 0) {
                Alert.alert(
                  "Día no disponible",
                  "Los domingos no laboramos. Por favor selecciona un día de Lunes a Sábado.",
                  [{ text: "Entendido" }]
                );
                return;
              }
              
              setShowDatePicker(false);
              await handleBuildTimeSlots();
              goTo("time");
            }}
          >
            <Text style={styles.mainButtonText}>Continuar</Text>
          </TouchableOpacity>
        )}

        {/* Botón Continuar siempre visible para Android y para cuando no está el picker */}
        {Platform.OS !== 'ios' && (
          <TouchableOpacity
            style={styles.mainButton}
            onPress={async () => {
              const dayOfWeek = selectedDate.getDay();
              if (dayOfWeek === 0) {
                Alert.alert(
                  "Día no disponible",
                  "Los domingos no laboramos. Por favor selecciona un día de Lunes a Sábado.",
                  [{ text: "Entendido" }]
                );
                return;
              }
              
              setShowDatePicker(false);
              await handleBuildTimeSlots(selectedDate);
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
      
      {timeSlots.length === 0 ? (
        <View style={styles.noSlotsContainer}>
          <Ionicons name="calendar-outline" size={48} color={theme.colors.subtext} />
          <Text style={styles.noSlotsText}>
            {selectedDate.getDay() === 0 
              ? "No abrimos los domingos" 
              : "No hay horarios disponibles para este día"}
          </Text>
        </View>
      ) : (
        <View style={styles.timeGrid}>
          {timeSlots.map((t) => {
            if (!t.available) {
              // Usar View en lugar de TouchableOpacity para horas ocupadas
              return (
                <View
                  key={t.time}
                  style={[
                    styles.timeChip,
                    styles.timeChipDisabled
                  ]}
                >
                  <Text style={[
                    styles.timeText,
                    styles.timeTextDisabled
                  ]}>
                    {t.time}
                  </Text>
                  <Ionicons 
                    name="lock-closed" 
                    size={14} 
                    color={theme.colors.subtext} 
                    style={styles.lockIcon}
                  />
                </View>
              );
            }
            
            // SoloTouchableOpacity para horas disponibles
            return (
              <TouchableOpacity
                key={t.time}
                style={styles.timeChip}
                onPress={() => {
                  setSelectedTime(t.time);
                  goTo("confirm");
                }}
              >
                <Text style={styles.timeText}>{t.time}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      )}
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
    timeChipDisabled: {
      backgroundColor: '#2a2a2a',
      borderColor: '#444',
      borderWidth: 1,
    },
    timeTextDisabled: {
      color: '#666',
    },
    lockIcon: {
      marginTop: 4,
    },
    noSlotsContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 40,
    },
    noSlotsText: {
      marginTop: 16,
      fontSize: 16,
      color: theme.colors.subtext,
      textAlign: 'center',
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
