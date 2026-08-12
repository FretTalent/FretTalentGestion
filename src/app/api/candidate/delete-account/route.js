import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function POST(req) {
  try {
    const cookieStore = cookies();
    
    // Auth client to verify who is requesting
    const supabaseAuth = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          get(name) {
            return cookieStore.get(name)?.value;
          },
        },
      }
    );

    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    // Ensure it is a candidate
    const { data: profile } = await supabaseAuth.from('profiles').select('role').eq('id', user.id).single();
    if (profile?.role !== 'candidate') {
      return NextResponse.json({ error: 'Action non autorisée' }, { status: 403 });
    }

    // Admin client to delete the user
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    // Delete user (cascade will delete profiles, candidates, etc., based on DB schema)
    // If no ON DELETE CASCADE, we should manually delete them, but Supabase auth delete is standard.
    // Let's delete profiles explicitly just in case cascade is not setup.
    await supabaseAdmin.from('profiles').delete().eq('id', user.id);
    await supabaseAdmin.from('candidates').delete().eq('id', user.id);
    
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(user.id);
    if (deleteError) {
      console.error('Error deleting auth user:', deleteError);
      return NextResponse.json({ error: 'Erreur lors de la suppression' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Account deletion error:', error);
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
  }
}
