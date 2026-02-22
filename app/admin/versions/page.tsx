import { Card } from '@/components/ui/card';
import { requireAdmin } from '@/lib/auth/guards';

export default async function AdminVersionsPage() {
  const { supabase } = await requireAdmin();
  const { data: versions } = await supabase.from('assessment_versions').select('*').order('created_at', { ascending: false });

  return (
    <Card title="إدارة إصدارات التقييم">
      <p className="muted">الحالات: مسودة / منشور / مؤرشف</p>
      <ul>
        {(versions ?? []).map((v: any) => <li key={v.id}>{v.id} - {v.is_published ? 'منشور' : 'مسودة'}</li>)}
      </ul>
    </Card>
  );
}
