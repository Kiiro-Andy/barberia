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
      console.log("Esperando userId para configurar notificaciones...");
      return;
    }

    console.log("Configurando notificaciones para el usuario:", userId);

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
      console.log('Notificación recibida en primer plano:', n);
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener(n => {
      console.log('Usuario tocó la notificación:', n);
    });

    return () => {
      if (notificationListener.current) Notifications.removeNotificationSubscription(notificationListener.current);
      if (responseListener.current) Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, [userId]);

  const registerForPushNotificationsAsync = async () => {
    if (!Device.isDevice) {
      console.log('Aviso: Debes usar un dispositivo físico para recibir un Push Token');
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
      console.log("Token generado con éxito:", token);
      return token;
    } catch (e) {
      console.error('Error al generar el token de Expo:', e);
      return '';
    }
  };

  const savePushToken = async (token, userId) => {
    console.log("Actualizando token en la base de datos...");
    const { error } = await supabase
      .from('profiles')
      .update({ expo_push_token: token })
      .eq('id', userId);

    if (error) {
      console.error('ERROR AL GUARDAR EN SUPABASE:', error.message);
    } else {
      console.log('¡TOKEN ACTUALIZADO EXITOSAMENTE EN SUPABASE!');
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