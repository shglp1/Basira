import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export default async function ResultsPage({ searchParams }: { searchParams: { assessmentId?: string } }) {
  const supabase = await createSupabaseServerClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) redirect('/login');

  const assessmentId = searchParams.assessmentId;
  if (!assessmentId) redirect('/dashboard');

  const { data: score } = await supabase
    .from('scores')
    .select('confidence_score,confidence_band,profile_json')
    .eq('assessment_id', assessmentId)
    .maybeSingle();

  const { data: matches } = await supabase
    .from('matches')
    .select('adjusted_score,reasons_json,occupations(title_ar)')
    .eq('assessment_id', assessmentId)
    .order('adjusted_score', { ascending: false })
    .limit(10);

  if (!score) {
    return (
      <main>
        <div className="card"><p>جاري المعالجة...</p></div>
      </main>
    );
  }

  const band = String(score.confidence_band).toLowerCase();

  return (
    <main>
      <h2>التقرير التفاعلي</h2>
      {score.confidence_band === 'Low' ? (
        <div className="card" style={{ border: '2px solid #dc2626' }}>
          <strong>تنبيه: مستوى الثقة منخفض، يفضل إعادة التقييم بهدوء.</strong>
        </div>
      ) : null}
      <div className="card">
        <p>درجة الثقة: <strong>{score.confidence_score}</strong> <span className={`badge ${band}`}>{score.confidence_band}</span></p>
      </div>
      <div className="card">
        <h3>أفضل 10 وظائف</h3>
        <table className="table">
          <thead><tr><th>الوظيفة</th><th>الدرجة</th><th>الأسباب</th></tr></thead>
          <tbody>
            {(matches ?? []).map((m: any, i: number) => (
              <tr key={`${m.occupations?.title_ar}-${i}`}>
                <td>{m.occupations?.title_ar}</td>
                <td>{m.adjusted_score}</td>
                <td>{Array.isArray(m.reasons_json) ? m.reasons_json.join('، ') : '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
