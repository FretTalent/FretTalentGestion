import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import {
  sendCandidateReminderDay1,
  sendCandidateReminderDay4,
  sendCandidateReminderDay10,
} from '@/lib/email-service';

export async function GET(req) {
  try {
    // Vérification de sécurité du cron si CRON_SECRET est configuré
    const authHeader = req.headers.get('authorization');
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({ error: 'Supabase credentials missing' }, { status: 500 });
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Récupérer tous les candidats non validés
    const { data: candidates, error } = await supabaseAdmin
      .from('candidates')
      .select('id, full_name, email, created_at, validated, documents, is_active, reminders_count, last_reminder_step')
      .eq('validated', false);

    if (error) {
      console.error('Erreur récupération candidats:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const now = new Date();
    const results = {
      total_checked: candidates?.length || 0,
      day1_sent: [],
      day4_sent: [],
      day10_sent: [],
      skipped_with_docs: 0,
    };

    for (const candidate of candidates || []) {
      const docs = candidate.documents;
      const hasDocs = docs && typeof docs === 'object' && Object.keys(docs).length > 0;

      // Si le candidat a déjà déposé au moins un document, on ne le relance pas
      if (hasDocs) {
        results.skipped_with_docs++;
        continue;
      }

      if (!candidate.email) continue;

      const createdAt = new Date(candidate.created_at);
      const diffTime = Math.abs(now - createdAt);
      const daysElapsed = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      const name = candidate.full_name || 'Chauffeur';
      const lastStep = candidate.last_reminder_step || 0;

      let sent = false;
      let newStep = lastStep;

      if (daysElapsed >= 10 && lastStep < 10) {
        // J+10 : Rappel bienveillant pour maximiser les contacts recruteurs (compte maintenu actif)
        await sendCandidateReminderDay10(candidate.email, name);
        results.day10_sent.push({ email: candidate.email, days: daysElapsed });
        sent = true;
        newStep = 10;
      } else if (daysElapsed >= 4 && lastStep < 4) {
        // J+4 : Deuxième rappel opportunités
        await sendCandidateReminderDay4(candidate.email, name);
        results.day4_sent.push({ email: candidate.email, days: daysElapsed });
        sent = true;
        newStep = 4;
      } else if (daysElapsed >= 1 && lastStep < 1) {
        // J+1 : Premier rappel bienveillant
        await sendCandidateReminderDay1(candidate.email, name);
        results.day1_sent.push({ email: candidate.email, days: daysElapsed });
        sent = true;
        newStep = 1;
      }

      if (sent) {
        await supabaseAdmin
          .from('candidates')
          .update({
            reminders_count: (candidate.reminders_count || 0) + 1,
            last_reminder_step: newStep,
            last_reminded_at: new Date().toISOString(),
          })
          .eq('id', candidate.id);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Traitement des rappels candidats terminé',
      results,
    });
  } catch (err) {
    console.error('Erreur cron candidate reminders:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
