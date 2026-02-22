import Link from 'next/link';
import { Card } from '@/components/ui/card';

export default function ForbiddenPage() {
  return (
    <Card title="403 - غير مصرح">
      <p>ليس لديك صلاحية الوصول إلى هذه الصفحة.</p>
      <Link href="/dashboard">العودة إلى لوحة التحكم</Link>
    </Card>
  );
}
