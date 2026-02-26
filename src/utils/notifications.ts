import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configurar el comportamiento de las notificaciones
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    // Para SDK 43+ usar shouldShowBanner en lugar de shouldShowAlert
    // Pero mantenemos ambos por compatibilidad
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

/**
 * Solicita permisos para enviar notificaciones
 * @returns true si se otorgaron los permisos, false en caso contrario
 */
export async function requestNotificationPermissions(): Promise<boolean> {
  // Las notificaciones locales funcionan mejor en dispositivos físicos
  // En el simulador/emulador pueden no funcionar correctamente
  if (Platform.OS === 'web') {
    console.log('Las notificaciones no están soportadas en web');
    return false;
  }
  
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  
  if (existingStatus === 'granted') {
    return true;
  }

  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

/**
 * Envía una notificación de prueba inmediata para verificar que el sistema funciona
 * @returns true si se envió correctamente
 */
export async function sendTestNotification(): Promise<boolean> {
  try {
    console.log('=== ENVIANDO NOTIFICACIÓN DE PRUEBA ===');
    
    const hasPermission = await requestNotificationPermissions();
    console.log('¿Tiene permisos?', hasPermission);
    
    if (!hasPermission) {
      console.log('ERROR: No hay permisos de notificaciones');
      return false;
    }

    // Programar una notificación para 5 segundos en el futuro
    const testDate = new Date();
    testDate.setSeconds(testDate.getSeconds() + 5);
    
    console.log('Fecha de prueba:', testDate.toString());
    
    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: '🧪 Notificación de prueba',
        body: 'Si recibes esto, las notificaciones están funcionando correctamente!',
        data: { type: 'test' },
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: testDate,
      },
    });

    console.log('Notificación de prueba programada con ID:', notificationId);
    console.log('===========================================');
    return true;
  } catch (error) {
    console.error('Error al enviar notificación de prueba:', error);
    return false;
  }
}

/**
 * Programa una notificación para recordar al usuario 1 hora antes de su cita
 * @param appointmentDate - Fecha de la cita
 * @param appointmentTime - Hora de la cita (formato HH:mm)
 * @param barberName - Nombre del barbero
 * @returns El identificador de la notificación programada
 */
export async function scheduleAppointmentReminder(
  appointmentDate: Date,
  appointmentTime: string,
  barberName: string
): Promise<string | null> {
  try {
    console.log('=== PROGRAMANDO RECORDATORIO DE CITA ===');
    console.log('Fecha de cita:', appointmentDate.toDateString());
    console.log('Hora de cita:', appointmentTime);
    console.log('Barbero:', barberName);
    
    // Solicitar permisos primero
    const hasPermission = await requestNotificationPermissions();
    console.log('¿Tiene permisos?', hasPermission);
    
    if (!hasPermission) {
      console.log('ERROR: Permisos de notificaciones no otorgados');
      return null;
    }

    // Convertir la hora de la cita a minutos desde medianoche
    const [hours, minutes] = appointmentTime.split(':').map(Number);
    
    // Crear la fecha y hora de la cita
    const appointmentDateTime = new Date(appointmentDate);
    appointmentDateTime.setHours(hours, minutes, 0, 0);

    console.log('Fecha y hora de la cita:', appointmentDateTime.toString());

    // Restar 1 hora para obtener el momento del recordatorio
    const reminderTime = new Date(appointmentDateTime.getTime() - 60 * 60 * 1000);

    console.log('Fecha del recordatorio (1 hora antes):', reminderTime.toString());

    // Verificar que el recordatorio sea en el futuro
    const now = new Date();
    console.log('Hora actual:', now.toString());
    
    const timeDiff = reminderTime.getTime() - now.getTime();
    console.log('Diferencia de tiempo (ms):', timeDiff);
    console.log('Diferencia de tiempo (segundos):', Math.floor(timeDiff / 1000));
    
    if (reminderTime <= now) {
      console.log('ERROR: El recordatorio sería en el pasado, no se programa');
      console.log('Esto significa que la cita está dentro de menos de 1 hora');
      return null;
    }

    // Verificar que el recordatorio esté al menos a 60 segundos de distancia
    // Las notificaciones con menos de 60 segundos pueden no dispararse
    if (timeDiff < 60000) {
      console.log('ADVERTENCIA: El recordatorio está a menos de 60 segundos');
      console.log('Las notificaciones muy cercanas pueden no dispararse');
    }

    // Formatear hora de la cita para mostrar
    const timeString = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
    
    // Formatear fecha para mostrar
    const dateString = appointmentDate.toLocaleDateString('es-MX', {
      weekday: 'long',
      day: 'numeric',
      month: 'long'
    });

    // Programar la notificación
    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: '⏰ Recordatorio de cita',
        body: `Tu cita con ${barberName} es en 1 hora (${timeString})`,
        data: {
          type: 'appointment_reminder',
          appointmentDate: appointmentDate.toISOString(),
          appointmentTime: appointmentTime,
          barberName: barberName
        },
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: reminderTime,
      },
    });

    console.log(`Notificación programada con ID: ${notificationId}`);
    console.log(`Recordatorio para: ${reminderTime.toLocaleString()}`);
    console.log(`Cita a las: ${appointmentDateTime.toLocaleString()}`);
    console.log('===========================================');
    
    return notificationId;
  } catch (error) {
    console.error('Error al programar la notificación:', error);
    return null;
  }
}

/**
 * Cancela una notificación programada
 * @param notificationId - ID de la notificación a cancelar
 */
export async function cancelNotification(notificationId: string): Promise<void> {
  try {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
    console.log(`Notificación ${notificationId} cancelada`);
  } catch (error) {
    console.error('Error al cancelar la notificación:', error);
  }
}

/**
 * Cancela todas las notificaciones programadas
 */
export async function cancelAllNotifications(): Promise<void> {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    console.log('Todas las notificaciones canceladas');
  } catch (error) {
    console.error('Error al cancelar todas las notificaciones:', error);
  }
}

/**
 * Obtiene todas las notificaciones programadas
 */
export async function getScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
  try {
    return await Notifications.getAllScheduledNotificationsAsync();
  } catch (error) {
    console.error('Error al obtener notificaciones programadas:', error);
    return [];
  }
}

