import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { requireAdmin } from '@/lib/auth/guards';

export default async function AdminPage() {
  const { supabase } = await requireAdmin();
  const [{ count: assessmentCount }, { data: scoreRows }] = await Promise.all([
    supabase.from('assessments').select('*', { count: 'exact', head: true }),
    supabase.from('scores').select('confidence_score').limit(1000)
  ]);
  const avgConfidence = scoreRows?.length ? Math.round(scoreRows.reduce((a: number, b: any) => a + Number(b.confidence_score), 0) / scoreRows.length) : 0;

  return (
    <div className="grid grid-2">
      <Card title="إجمالي التقييمات"><div className="kpi">{assessmentCount ?? 0}</div></Card>
      <Card title="متوسط الثقة"><div className="kpi">{avgConfidence}</div></Card>
      <Card title="إدارة المحتوى">
        <div className="links">
          <Link href="/admin/versions">الإصدارات</Link>
          <Link href="/admin/items">بنك الأسئلة</Link>
          <Link href="/admin/occupations">خريطة الوظائف</Link>
          <Link href="/admin/analytics">التحليلات</Link>
        </div>
      </Card>
    </div>
  );
}
