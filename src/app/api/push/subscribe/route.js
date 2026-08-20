import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(req) {
  try {
    const { subscription, userId, role } = await req.json();

    if (!subscription || !subscription.endpoint) {
      return NextResponse.json({ error: 'Abonnement Push invalide' }, { status: 400 });
    }

    // Sauvegarder ou mettre à jour l'abonnement push dans Supabase
    const { data, error } = await supabase
      .from('push_subscriptions')
      .upsert(
        {
          endpoint: subscription.endpoint,
          subscription: subscription,
          user_id: userId || null,
          role: role || 'candidate',
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'endpoint' }
      );

    if (error) {
      // Si la table n'existe pas encore ou erreur de RLS, ne pas bloquer l'utilisateur
      console.warn('Supabase push_subscriptions upsert notice:', error.message);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Erreur API /api/push/subscribe:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
