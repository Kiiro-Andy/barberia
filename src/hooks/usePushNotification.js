// hooks/usePushNotifications.js
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
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });

    registerForPushNotificationsAsync().then(token => {
      if (token) {
        setExpoPushToken(token);
        savePushToken(token, userId);
      }
    });

    notificationListener.current = Notifications.addNotificationReceivedListener(n => {
      console.log('Notif recibida:', n);
    });
    responseListener.current = Notifications.addNotificationResponseReceivedListener(n => {
      console.log('Tap:', n);
    });

    return () => {
      notificationListener.current?.remove();
      responseListener.current?.remove();
    };
  }, [userId]);

  const registerForPushNotificationsAsync = async () => {
    if (!Device.isDevice) return '';

    const { status } = await Notifications.getPermissionsAsync();
    let finalStatus = status;
    if (finalStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') return '';

    const projectId = Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;
    if (!projectId) return '';

    try {
      return (await Notifications.getExpoPushTokenAsync({ projectId })).data;
    } catch (e) {
      console.error('Error token:', e);
      return '';
    }
  };

  const savePushToken = async (token, userId) => {
    await supabase.from('profiles').upsert({ id: userId, expo_push_token: token });
  };

  const sendPushNotification = async (title, body) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user?.id) return;

    const { error } = await supabase.functions.invoke('send-push', {
      body: { user_id: user.id, title, body },
    });
    if (error) console.error('Error:', error);
  };

  return { expoPushToken, sendPushNotification };
};
