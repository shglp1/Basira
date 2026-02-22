import { Card } from '@/components/ui/card';
import { requireAdmin } from '@/lib/auth/guards';

export default async function AdminOccupationsPage() {
  const { supabase } = await requireAdmin();
  const { data } = await supabase.from('occupations').select('id,title_ar,stress_level,riasec_vector').limit(200);

  return (
    <Card title="خريطة الوظائف">
      <ul>
        {(data ?? []).map((o: any) => <li key={o.id}>{o.title_ar} | ضغط: {o.stress_level} | RIASEC: {(o.riasec_vector ?? []).join(', ')}</li>)}
      </ul>
    </Card>
  );
}
