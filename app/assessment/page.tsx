import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import AssessmentClient from './components/assessment-client';

export default async function AssessmentPage({ searchParams }: { searchParams: { assessmentId?: string } }) {
  const supabase = await createSupabaseServerClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) redirect('/login');

  const requestedId = searchParams.assessmentId;

  let query = supabase
    .from('assessments')
    .select('id,version_id')
    .eq('user_id', auth.user.id)
    .eq('status', 'started');

  if (requestedId) {
    query = query.eq('id', requestedId);
  } else {
    query = query.order('started_at', { ascending: false }).limit(1);
  }

  const { data: assessment } = await query.maybeSingle();
  if (!assessment) redirect('/dashboard');

  const { data: items } = await supabase
    .from('items')
    .select('id,text_ar')
    .eq('version_id', assessment.version_id)
    .order('created_at', { ascending: true });

  const { data: responses } = await supabase
    .from('responses')
    .select('item_id,value,response_time_ms')
    .eq('assessment_id', assessment.id);

  const initialResponses = Object.fromEntries(
    (responses ?? []).map((r: any) => [r.item_id, { value: r.value, response_time_ms: r.response_time_ms }])
  );

  return (
    <main>
      <h2>التقييم</h2>
      <AssessmentClient assessmentId={assessment.id} items={items ?? []} initialResponses={initialResponses} />
    </main>
  );
}
