// hooks/useCitasRealtime.js
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export const useCitasRealtime = (userId) => {
  const [citas, setCitas] = useState([]);

  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel('citas-user')
      .on(
        'postgres_changes',
        {
          event: '*', // Escucha inserts, updates y deletes
          schema: 'public',
          table: 'citas',
          filter: `cliente_id=eq.${userId}`,
        },
        (payload) => {
          console.log('Cambio detectado en citas:', payload);
          fetchCitas(); // Solo refresca la lista en pantalla
        }
      )
      .subscribe();

    fetchCitas();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  const fetchCitas = async () => {
    const { data } = await supabase
      .from('citas')
      .select('*')
      .eq('cliente_id', userId)
      .order('fecha', { ascending: true });
    setCitas(data || []);
  };

  return { citas };
};