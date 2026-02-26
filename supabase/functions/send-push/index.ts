// 1. IMPORTACIONES NECESARIAS
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7'

serve(async (req) => {
  try {
    // 2. RECIBIR DATOS (Webhook o Manual)
    const payload = await req.json();
    console.log("Payload recibido:", payload);

    const isWebhook = !!payload.record;
    const user_id = isWebhook ? payload.record.user_id : payload.user_id; 
    const title = payload.title || (isWebhook ? "Actualización de Cita" : "Notificación");
    const body = payload.body || (isWebhook ? `Tu cita ahora está: ${payload.record.estado}` : "Tienes un nuevo mensaje");
    // 3. CONFIGURAR CLIENTE SUPABASE
    // Asegúrate de que estos nombres coincidan con los que pusiste en 'Secrets' (SB_URL y SB_SERVICE_ROLE_KEY)
    const supabaseUrl = Deno.env.get('SB_URL') ?? ''; 
    const supabaseKey = Deno.env.get('SB_SERVICE_ROLE_KEY') ?? ''; 
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error("Faltan las variables de entorno SB_URL o SB_SERVICE_ROLE_KEY");
    }

    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });

    // 4. BUSCAR EL TOKEN EN LA TABLA PROFILES
    const { data, error: dbError } = await supabase
      .from('profiles')
      .select('expo_push_token')
      .eq('id', user_id)
      .single();

    if (dbError || !data?.expo_push_token) {
      console.error("Error DB o Token no encontrado:", dbError);
      return new Response(JSON.stringify({ error: 'Token no encontrado para este usuario' }), { 
        status: 404, 
        headers: { "Content-Type": "application/json" } 
      });
    }

    // 5. ENVIAR A EXPO
    const message = {
      to: data.expo_push_token,
      title: title,
      body: body,
      sound: 'default',
    };

    const apiResponse = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: { 
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message),
    });

    const resData = await apiResponse.json();
    return new Response(JSON.stringify(resData), { 
      status: 200, 
      headers: { "Content-Type": "application/json" } 
    });

  } catch (error) {
    console.error("Error en la función:", error.message);
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 500, 
      headers: { "Content-Type": "application/json" } 
    });
  }
})