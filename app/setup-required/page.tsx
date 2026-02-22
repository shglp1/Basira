import Link from 'next/link';
import { Card } from '@/components/ui/card';

export default function SetupRequiredPage() {
  return (
    <Card title="النظام بحاجة إلى إعداد أولي">
      <p>لا توجد بيانات كافية لتشغيل التقييم (إصدارات/أسئلة/وظائف).</p>
      <div className="links">
        <Link href="/admin/versions">إعداد الإصدارات</Link>
        <Link href="/admin/items">إدارة الأسئلة</Link>
        <Link href="/admin/occupations">إدارة الوظائف</Link>
      </div>
    </Card>
  );
}
