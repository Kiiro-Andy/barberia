import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configurar el comportamiento de las notificaciones
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

/**
 * Solicita permisos para enviar notificaciones
 * @returns true si se otorgaron los permisos, false en caso contrario
 */
export async function requestNotificationPermissions(): Promise<boolean> {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  
  if (existingStatus === 'granted') {
    return true;
  }

  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
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
    // Solicitar permisos primero
    const hasPermission = await requestNotificationPermissions();
    if (!hasPermission) {
      console.log('Permisos de notificaciones no otorgados');
      return null;
    }

    // Convertir la hora de la cita a minutos desde medianoche
    const [hours, minutes] = appointmentTime.split(':').map(Number);
    
    // Crear la fecha y hora de la cita
    const appointmentDateTime = new Date(appointmentDate);
    appointmentDateTime.setHours(hours, minutes, 0, 0);

    // Restar 1 hora para obtener el momento del recordatorio
    const reminderTime = new Date(appointmentDateTime.getTime() - 60 * 60 * 1000);

    // Verificar que el recordatorio sea en el futuro
    const now = new Date();
    if (reminderTime <= now) {
      console.log('El recordatorio sería en el pasado, no se programa');
      return null;
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

