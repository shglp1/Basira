import { Card } from '@/components/ui/card';
import { requireAdmin } from '@/lib/auth/guards';

export default async function AdminAnalyticsPage() {
  const { supabase } = await requireAdmin();
  const [{ data: responses }, { data: scores }] = await Promise.all([
    supabase.from('responses').select('value,response_time_ms').limit(5000),
    supabase.from('scores').select('confidence_score').limit(5000)
  ]);

  const avgConfidence = scores?.length ? Math.round(scores.reduce((a: number, b: any) => a + Number(b.confidence_score), 0) / scores.length) : 0;
  const speedingRate = responses?.length ? responses.filter((r: any) => Number(r.response_time_ms) < 1200).length / responses.length : 0;
  const freq: Record<string, number> = {};
  (responses ?? []).forEach((r: any) => { const k = String(r.value); freq[k] = (freq[k] ?? 0) + 1; });

  return (
    <div className="grid grid-2">
      <Card title="متوسط الثقة"><div className="kpi">{avgConfidence}</div></Card>
      <Card title="معدل الاستعجال"><div className="kpi">{Math.round(speedingRate * 100)}%</div></Card>
      <Card title="أكثر الإجابات تكرارًا"><pre>{JSON.stringify(freq, null, 2)}</pre></Card>
      <Card title="خصوصية"><p>هذه الصفحة تعرض بيانات مجهولة بدون معلومات شخصية.</p></Card>
    </div>
  );
}
