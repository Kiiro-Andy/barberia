Deno.serve(async (req) => {
  try {
    const { user_id, title, body } = await req.json();

    // Cliente Supabase con service_role (acceso total)
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });

    const { data } = await supabase
      .from('profiles')
      .select('expo_push_token')
      .eq('id', user_id)
      .single();

    if (!data?.expo_push_token) {
      return new Response('Token no encontrado', { status: 404 });
    }

    const message = {
      to: data.expo_push_token,
      title,
      body,
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

    return new Response(JSON.stringify(await apiResponse.json()), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
});
