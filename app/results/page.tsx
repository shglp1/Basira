import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Table } from '@/components/ui/table';
import { requireUser } from '@/lib/auth/guards';

function Bar({ label, value }: { label: string; value: number }) {
  return (
    <div style={{ marginBottom: 8 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}><strong>{label}</strong><span>{value}</span></div>
      <div className="progress"><div style={{ width: `${value}%` }} /></div>
    </div>
  );
}

export default async function ResultsPage({ searchParams }: { searchParams: { assessmentId?: string } }) {
  const { supabase, user } = await requireUser();

  const assessmentId = searchParams.assessmentId;
  if (!assessmentId) {
    return <Card title="اختر نتيجة"><p>اذهب للوحة التحكم واختر نتيجة من السجل.</p></Card>;
  }

  const [{ data: assessment }, { data: score }, { data: matches }] = await Promise.all([
    supabase.from('assessments').select('id').eq('id', assessmentId).eq('user_id', user.id).maybeSingle(),
    supabase.from('scores').select('confidence_score,confidence_band,profile_json').eq('assessment_id', assessmentId).maybeSingle(),
    supabase.from('matches').select('adjusted_score,reasons_json,occupations(title_ar)').eq('assessment_id', assessmentId).order('adjusted_score', { ascending: false }).limit(10)
  ]);

  if (!assessment) return <Card title="غير متاح"><p>لا يمكنك الوصول إلى هذه النتيجة.</p></Card>;
  if (!score) return <Card title="جاري المعالجة"><div className="skeleton" /></Card>;

  const profile = score.profile_json as any;
  const bf = profile?.scores?.big_five ?? {};
  const ri = profile?.scores?.riasec ?? {};
  const confidenceBand = String(score.confidence_band).toLowerCase();

  return (
    <div className="grid">
      {score.confidence_band === 'Low' ? <Card><strong style={{ color: '#991b1b' }}>تنبيه: مستوى الثقة منخفض. يُنصح بإعادة التقييم بهدوء.</strong></Card> : null}

      <Card title="الملخص التنفيذي">
        <p>درجة الثقة: <strong>{score.confidence_score}</strong> <span className={`badge ${confidenceBand}`}>{score.confidence_band}</span></p>
        <p className="muted">تُحتسب الثقة من مؤشرات السلوك والاتساق والانطباع. كلما ارتفعت كانت دقة التوجيه أفضل.</p>
      </Card>

      <div className="grid grid-2">
        <Card title="سمات الشخصية - Big Five">
          <Bar label="الانفتاح" value={bf.O ?? 0} />
          <Bar label="الضمير الحي" value={bf.C ?? 0} />
          <Bar label="الانبساط" value={bf.E ?? 0} />
          <Bar label="التوافق" value={bf.A ?? 0} />
          <Bar label="الاستقرار الانفعالي" value={bf.N_emotional_stability ?? 0} />
        </Card>
        <Card title="الميول المهنية - RIASEC">
          <Bar label="عملي R" value={ri.R ?? 0} />
          <Bar label="بحثي I" value={ri.I ?? 0} />
          <Bar label="فني A" value={ri.A ?? 0} />
          <Bar label="اجتماعي S" value={ri.S ?? 0} />
          <Bar label="ريادي E" value={ri.E ?? 0} />
          <Bar label="تقليدي C" value={ri.C ?? 0} />
        </Card>
      </div>

      <Card title="أفضل 10 وظائف">
        <Table>
          <thead><tr><th>الوظيفة</th><th>الدرجة</th><th>الأسباب</th></tr></thead>
          <tbody>
            {(matches ?? []).map((m: any, idx: number) => (
              <tr key={idx}><td>{m.occupations?.title_ar ?? '-'}</td><td>{m.adjusted_score}</td><td>{Array.isArray(m.reasons_json) ? m.reasons_json.join('، ') : '-'}</td></tr>
            ))}
          </tbody>
        </Table>
      </Card>

      <Card>
        <div className="links">
          <Link href={`/api/report/pdf?assessmentId=${assessmentId}`}>تحميل PDF</Link>
          <Link href={`/api/report/share?assessmentId=${assessmentId}`}>توليد بطاقة مشاركة</Link>
        </div>
      </Card>
    </div>
  );
}
