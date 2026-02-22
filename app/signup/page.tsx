'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function SignupPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [ok, setOk] = useState('');
  const router = useRouter();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.auth.signUp({ email, password, options: { data: { full_name: fullName } } });
    if (error) return setError('تعذر إنشاء الحساب.');
    setOk('تم إنشاء الحساب بنجاح.');
    router.push('/dashboard');
  };

  return (
    <Card title="إنشاء حساب جديد">
      <form onSubmit={submit}>
        <label>الاسم الكامل</label>
        <Input value={fullName} onChange={(e) => setFullName(e.target.value)} required />
        <label>البريد الإلكتروني</label>
        <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <label>كلمة المرور</label>
        <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} />
        <Button type="submit">تسجيل</Button>
      </form>
      {ok ? <p style={{ color: '#166534' }}>{ok}</p> : null}
      {error ? <p style={{ color: '#991b1b' }}>{error}</p> : null}
    </Card>
  );
}
