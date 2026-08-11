import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { REQUIRED_DOCUMENT_TYPES } from '@/lib/validation/candidateValidation';

// Helper to get the admin session (or any privileged role)
async function getAdminSession() {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw new Error('Auth error');
  // Assuming you store the role in the user metadata or a profile table.
  // Adjust the check according to your auth implementation.
  const { data: user } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', data.session.user.id)
    .single();

  if (!user || user.role !== 'admin') {
    throw new Error('Forbidden');
  }
  return data.session;
}

/**
 * POST /api/candidates/[id]/validate
 * Body: { candidateId: string }
 * Returns: { success: boolean, candidate: record }
 */
export async function POST(request, { params }) {
  const candidateId = params.id;

  // 1️⃣ Verify admin session
  try {
    await getAdminSession();
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 403 });
  }

  // 2️⃣ Fetch candidate + profile + documents
  const { data: candidate, error: fetchErr } = await supabase
    .from('candidates')
    .select('documents, profile')
    .eq('id', candidateId)
    .single();

  if (fetchErr) {
    return NextResponse.json({ error: fetchErr.message }, { status: 400 });
  }

  // 3️⃣ Validate required document types are present
  const docTypesPresent = new Set(
    Object.keys(candidate.documents || {}).map(t => t.toLowerCase()),
  );

  const missingDocs = [...REQUIRED_DOCUMENT_TYPES].filter(
    t => !docTypesPresent.has(t),
  );
  if (missingDocs.length > 0) {
    return NextResponse.json(
      { error: `Missing required document types: ${missingDocs.join(', ')}` },
      { status: 400 },
    );
  }

  // 4️⃣ Validate required profile fields (customize to your schema)
  const requiredProfileFields = ['company', 'role', 'location'];
  const missingFields = requiredProfileFields.filter(
    f => !candidate.profile?.[f],
  );
  if (missingFields.length > 0) {
    return NextResponse.json(
      { error: `Missing profile fields: ${missingFields.join(', ')}` },
      { status: 400 },
    );
  }

  // 5️⃣ Mark as validated
  const { data: updated, error: updateErr } = await supabase
    .from('candidates')
    .update({
      validated: true,
      validated_at: new Date().toISOString(),
    })
    .eq('id', candidateId)
    .select()
    .single();

  if (updateErr) {
    return NextResponse.json({ error: updateErr.message }, { status: 400 });
  }

  return NextResponse.json({ success: true, candidate: updated });
}
