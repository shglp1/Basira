import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export default async function DashboardPage() {
  const supabase = await createSupabaseServerClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) redirect('/login');

  const { data: assessments } = await supabase
    .from('assessments')
    .select('id,version_id,status,started_at,completed_at,scores(confidence_score)')
    .eq('user_id', auth.user.id)
    .order('started_at', { ascending: false });

  return (
    <main>
      <h2>لوحة التحكم</h2>
      <div className="card">
        <form method="post" action="/api/assessment/start">
          <button className="btn" type="submit">بدء تقييم جديد</button>
        </form>
      </div>
      <div className="card">
        <h3>التقييمات السابقة</h3>
        <ul>
          {(assessments ?? []).map((a: any) => (
            <li key={a.id}>
              {a.version_id} - {a.status} - الثقة: {a.scores?.[0]?.confidence_score ?? '-'}
            </li>
          ))}
        </ul>
      </div>
      <div className="card">
        <form method="post" action="/api/logout">
          <button className="btn" type="submit">تسجيل الخروج</button>
        </form>
      </div>
    </main>
  );
}
