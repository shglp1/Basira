import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { requireUser } from '@/lib/auth/guards';

export default async function DashboardPage() {
  const { supabase, user } = await requireUser();

  const [{ data: active }, { data: history }] = await Promise.all([
    supabase
      .from('assessments')
      .select('id,started_at')
      .eq('user_id', user.id)
      .eq('status', 'started')
      .order('started_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from('assessments')
      .select('id,completed_at,scores(confidence_score,confidence_band)')
      .eq('user_id', user.id)
      .eq('status', 'completed')
      .order('completed_at', { ascending: false })
      .limit(10)
  ]);

  return (
    <div className="grid">
      <Card title="مرحبًا بك في لوحة التحكم">
        {active ? (
          <div>
            <p>لديك تقييم قيد التقدم.</p>
            <Link href={`/assessment?assessmentId=${active.id}`}>استكمال التقييم</Link>
          </div>
        ) : (
          <form method="post" action="/api/assessment/start"><button className="btn btn-primary">بدء تقييم جديد</button></form>
        )}
      </Card>

      <Card title="نتائجك السابقة">
        {history?.length ? (
          <ul>
            {history.map((a: any) => (
              <li key={a.id}>
                <Link href={`/results?assessmentId=${a.id}`}>نتيجة بتاريخ {new Date(a.completed_at).toLocaleDateString('ar-SA')} - ثقة {a.scores?.[0]?.confidence_score}</Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="muted">لا توجد نتائج بعد.</p>
        )}
      </Card>
    </div>
  );
}
