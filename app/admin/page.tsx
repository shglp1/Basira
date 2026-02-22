import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export default async function AdminPage() {
  const supabase = await createSupabaseServerClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) redirect('/login');

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', auth.user.id).maybeSingle();
  if (profile?.role !== 'admin') {
    return <main><div className="card"><p>غير مصرح: هذه الصفحة للمشرفين فقط.</p></div></main>;
  }

  return (
    <main>
      <h2>Admin Console</h2>
      <div className="card"><p>إدارة الأسئلة والوظائف متاحة للمشرف فقط. إصدارات منشورة غير قابلة للتعديل.</p></div>
      <div className="card"><p>التحليلات في V1 تعرض بيانات مجمّعة ومجهولة فقط.</p></div>
    </main>
  );
}
