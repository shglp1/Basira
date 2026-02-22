import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export async function POST(req: Request) {
  const supabase = await createSupabaseServerClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { assessmentId, itemId, value, response_time_ms } = body;

  const { data: assessment } = await supabase
    .from('assessments')
    .select('id')
    .eq('id', assessmentId)
    .eq('user_id', auth.user.id)
    .maybeSingle();

  if (!assessment) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { error } = await supabase.from('responses').upsert(
    {
      assessment_id: assessmentId,
      item_id: itemId,
      value,
      response_time_ms
    },
    { onConflict: 'assessment_id,item_id' }
  );

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
