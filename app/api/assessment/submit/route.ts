import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { processAssessment } from '@/lib/services/assessment';

export async function POST(req: Request) {
  const supabase = await createSupabaseServerClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { assessmentId } = await req.json();
  await processAssessment(assessmentId, auth.user.id);
  return NextResponse.json({ ok: true });
}
