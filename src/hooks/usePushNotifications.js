import { useState, useEffect, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { supabase } from '../utils/supabase';

export const usePushNotifications = (userId) => {
  const [expoPushToken, setExpoPushToken] = useState('');
  const notificationListener = useRef();
  const responseListener = useRef();

  useEffect(() => {
    if (!userId) {
      return;
    }

    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowAlert: true,
      }),
    });

    const setupNotifications = async () => {
      const token = await registerForPushNotificationsAsync();
      if (token) {
        setExpoPushToken(token);
        await savePushToken(token, userId);
      }
    };

    setupNotifications();

    notificationListener.current = Notifications.addNotificationReceivedListener(n => {
      // Notificación recibida
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener(n => {
      // Usuario tocó la notificación
    });

    return () => {
      if (notificationListener.current) Notifications.removeNotificationSubscription(notificationListener.current);
      if (responseListener.current) Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, [userId]);

  const registerForPushNotificationsAsync = async () => {
    if (!Device.isDevice) {
      return '';
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      console.error('Error: ¡Permiso de notificaciones denegado!');
      return '';
    }

    const projectId = Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;
    if (!projectId) {
      console.error('Error: No se encontró el projectId en app.json');
      return '';
    }

    try {
      const token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
      return token;
    } catch (e) {
      console.error('Error al generar el token de Expo:', e);
      return '';
    }
  };

  const savePushToken = async (token, userId) => {
    const { error } = await supabase
      .from('profiles')
      .update({ expo_push_token: token })
      .eq('id', userId);

    if (error) {
      console.error('ERROR AL GUARDAR EN SUPABASE:', error.message);
    }
  };

  const sendPushNotification = async (title, body) => {
    if (!userId) return;
    const { error } = await supabase.functions.invoke('send-push', {
      body: { user_id: userId, title, body },
    });
    if (error) console.error('Error invocando Edge Function:', error);
  };

  return { expoPushToken, sendPushNotification };
};