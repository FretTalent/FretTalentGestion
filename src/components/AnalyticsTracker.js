'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function AnalyticsTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const lastTracked = useRef('');

  useEffect(() => {
    // Générer ou récupérer un ID de session anonyme dans le localStorage
    let sessionId = localStorage.getItem('frettalent_analytics_session');
    if (!sessionId) {
      sessionId = 'sess_' + Math.random().toString(36).substring(2) + '_' + Date.now();
      localStorage.setItem('frettalent_analytics_session', sessionId);
    }

    const currentUrl = pathname + (searchParams.toString() ? `?${searchParams.toString()}` : '');

    // Éviter d'enregistrer deux fois la même URL consécutivement
    if (lastTracked.current === currentUrl) return;
    lastTracked.current = currentUrl;

    const trackView = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const headers = { 'Content-Type': 'application/json' };
        if (session?.access_token) {
          headers['Authorization'] = `Bearer ${session.access_token}`;
        }

        await fetch('/api/analytics/track', {
          method: 'POST',
          headers,
          body: JSON.stringify({
            path: currentUrl,
            page_title: document.title || currentUrl,
            referrer: document.referrer || '',
            session_id: sessionId,
          }),
        });
      } catch (err) {
        // Ignorer silencieusement pour le client
      }
    };

    // Légère temporisation pour capturer le document.title à jour
    const timer = setTimeout(trackView, 300);
    return () => clearTimeout(timer);
  }, [pathname, searchParams]);

  return null;
}
