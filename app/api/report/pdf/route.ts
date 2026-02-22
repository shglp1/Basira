import { requireUser } from '@/lib/auth/guards';

function simplePdf(text: string): Uint8Array {
  const content = `BT /F1 12 Tf 50 760 Td (${text.replace(/[()]/g, '')}) Tj ET`;
  const pdf = `%PDF-1.4\n1 0 obj<< /Type /Catalog /Pages 2 0 R >>endobj\n2 0 obj<< /Type /Pages /Kids [3 0 R] /Count 1 >>endobj\n3 0 obj<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>endobj\n4 0 obj<< /Length ${content.length} >>stream\n${content}\nendstream endobj\n5 0 obj<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>endobj\nxref\n0 6\n0000000000 65535 f \n0000000010 00000 n \n0000000060 00000 n \n0000000117 00000 n \n0000000241 00000 n \n0000000338 00000 n \ntrailer<< /Root 1 0 R /Size 6 >>\nstartxref\n416\n%%EOF`;
  return new TextEncoder().encode(pdf);
}

export async function GET(req: Request) {
  const { supabase, user } = await requireUser();
  const url = new URL(req.url);
  const assessmentId = url.searchParams.get('assessmentId');
  if (!assessmentId) return new Response('missing assessmentId', { status: 400 });

  const { data: assessment } = await supabase.from('assessments').select('id').eq('id', assessmentId).eq('user_id', user.id).maybeSingle();
  if (!assessment) return new Response('forbidden', { status: 403 });

  const { data: score } = await supabase.from('scores').select('confidence_score,confidence_band').eq('assessment_id', assessmentId).maybeSingle();
  const bytes = simplePdf(`Baseera Report | Confidence ${score?.confidence_score ?? '-'} | Band ${score?.confidence_band ?? '-'}`);

  return new Response(bytes, {
    headers: {
      'content-type': 'application/pdf',
      'content-disposition': `attachment; filename="baseera-report-${assessmentId}.pdf"`
    }
  });
}
