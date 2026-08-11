import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

export async function DELETE(req) {
  try {
    const { userId } = await req.json();

    if (!userId) {
      return NextResponse.json(
        { error: "L'ID de l'utilisateur est requis" },
        { status: 400 },
      );
    }

    // Initialize Supabase client for verifying the admin status (uses requester's auth)
    const cookieStore = cookies();
    // To properly use next/headers with Supabase, we need a standard server client
    // For simplicity, we can extract the token from the cookie, but creating a service client is easier
    // Wait, let's just create a standard client with the anonymous key and the cookie header
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    // Verify admin role via service client since we don't have createRouteHandlerClient set up here
    const authHeader = req.headers.get('authorization');
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);

    if (!authHeader) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const {
      data: { user },
      error: userError,
    } = await supabaseAdmin.auth.getUser(token);

    if (userError || !user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    // Verify if requester is admin
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    // Delete user from auth.users (cascades to profiles, candidates, companies)
    const { error: deleteError } =
      await supabaseAdmin.auth.admin.deleteUser(userId);

    if (deleteError) {
      console.error('Error deleting user:', deleteError);
      return NextResponse.json(
        { error: 'Erreur lors de la suppression du compte' },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Utilisateur supprimé',
    });
  } catch (err) {
    console.error('Erreur serveur API delete user:', err);
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 });
  }
}
