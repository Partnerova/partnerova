import { NextResponse } from 'next/server';
import { createClient } from '../../../../lib/supabase-server';
import { createAdminClient } from '../../../../lib/supabase-admin';

export async function POST(request) {
  const { id } = await request.json();
  if (!id) return NextResponse.json({ error: 'id manquant' }, { status: 400 });

  // Vérifie que l'appelant est bien connecté ET admin (via le client normal, respecte la RLS)
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'admin') return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });

  // Supprime le compte d'authentification : profiles/marques/influenceurs/campagnes
  // disparaissent automatiquement en cascade.
  const admin = createAdminClient();
  const { error } = await admin.auth.admin.deleteUser(id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}
