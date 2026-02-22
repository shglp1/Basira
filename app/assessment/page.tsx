import { redirect } from 'next/navigation';
import AssessmentClient from './components/assessment-client';
import { requireUser } from '@/lib/auth/guards';

export default async function AssessmentPage({ searchParams }: { searchParams: { assessmentId?: string } }) {
  const { supabase, user } = await requireUser();

  const requestedId = searchParams.assessmentId;
  let query = supabase.from('assessments').select('id,version_id').eq('user_id', user.id).eq('status', 'started');
  query = requestedId ? query.eq('id', requestedId) : query.order('started_at', { ascending: false }).limit(1);

  const { data: assessment } = await query.maybeSingle();
  if (!assessment) redirect('/dashboard');

  const [{ data: items }, { data: responses }] = await Promise.all([
    supabase.from('items').select('id,text_ar').eq('version_id', assessment.version_id).order('created_at', { ascending: true }),
    supabase.from('responses').select('item_id,value,response_time_ms').eq('assessment_id', assessment.id)
  ]);

  if (!items?.length) {
    return (
      <div className="card">
        <h2>إعداد غير مكتمل</h2>
        <p>لا توجد أسئلة منشورة لهذا الإصدار بعد.</p>
        <a href="/setup-required">الانتقال لصفحة الإرشاد</a>
      </div>
    );
  }

  const initialResponses = Object.fromEntries((responses ?? []).map((r: any) => [r.item_id, { value: r.value, response_time_ms: r.response_time_ms }]));

  return (
    <div className="grid">
      <AssessmentClient assessmentId={assessment.id} items={items} initialResponses={initialResponses} />
    </div>
  );
}
