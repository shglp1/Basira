import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { startAssessment } from '@/lib/services/assessment';

export async function POST(req: Request) {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) return NextResponse.redirect(new URL('/login', req.url));

  const assessmentId = await startAssessment(data.user.id);
  return NextResponse.redirect(new URL(`/assessment?assessmentId=${assessmentId}`, req.url));
}
