import { requireUser } from '@/lib/auth/guards';

export async function GET(req: Request) {
  const { supabase, user } = await requireUser();
  const url = new URL(req.url);
  const assessmentId = url.searchParams.get('assessmentId');
  if (!assessmentId) return new Response('missing assessmentId', { status: 400 });

  const { data: assessment } = await supabase.from('assessments').select('id').eq('id', assessmentId).eq('user_id', user.id).maybeSingle();
  if (!assessment) return new Response('forbidden', { status: 403 });

  const { data: score } = await supabase.from('scores').select('confidence_score,confidence_band').eq('assessment_id', assessmentId).maybeSingle();

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630"><rect width="100%" height="100%" fill="#0f172a"/><text x="1100" y="150" fill="#fff" font-size="56" text-anchor="end">نتيجة بصيرة المهنية</text><text x="1100" y="260" fill="#93c5fd" font-size="42" text-anchor="end">درجة الثقة: ${score?.confidence_score ?? '-'}</text><text x="1100" y="330" fill="#e2e8f0" font-size="34" text-anchor="end">النطاق: ${score?.confidence_band ?? '-'}</text><text x="1100" y="560" fill="#94a3b8" font-size="28" text-anchor="end">baseera.sa</text></svg>`;

  return new Response(svg, { headers: { 'content-type': 'image/svg+xml', 'content-disposition': `attachment; filename="baseera-share-${assessmentId}.svg"` } });
}
