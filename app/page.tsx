import Link from 'next/link';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export default async function HomePage() {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.auth.getUser();

  return (
    <main>
      <div className="card">
        <h1>Baseera</h1>
        <p>منصة علمية للتوجيه المهني في السوق السعودي.</p>
        <p>
          "Baseera is an educational career guidance tool and does not provide psychological diagnosis,
          medical advice, or employment guarantees. The results are intended to provide insight and
          direction, not to serve as a definitive judgment."
        </p>
        {data.user ? (
          <Link className="btn" href="/dashboard">لوحة التحكم</Link>
        ) : (
          <div style={{ display: 'flex', gap: 8 }}>
            <Link className="btn" href="/signup">إنشاء حساب</Link>
            <Link className="btn" href="/login">تسجيل الدخول</Link>
          </div>
        )}
      </div>
    </main>
  );
}
