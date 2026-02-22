import Link from 'next/link';
import { Card } from '@/components/ui/card';

export default function HomePage() {
  return (
    <div className="grid">
      <Card>
        <h1>اكتشف مسارك المهني بثقة</h1>
        <p className="muted">منصة بصيرة: نظام علمي للتوجيه المهني في السعودية.</p>
        <p className="muted">بصيرة أداة تعليمية للتوجيه المهني وليست تشخيصًا طبيًا أو ضمانًا وظيفيًا.</p>
        <div className="links">
          <Link href="/signup">ابدأ الآن</Link>
          <Link href="/login">لديك حساب؟</Link>
        </div>
      </Card>
    </div>
  );
}
