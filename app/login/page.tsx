'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return setError('بيانات الدخول غير صحيحة.');
    router.push('/dashboard');
    router.refresh();
  };

  const oauth = async (provider: 'google' | 'linkedin_oidc') => {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signInWithOAuth({ provider, options: { redirectTo: `${window.location.origin}/dashboard` } as any });
  };

  return (
    <Card title="تسجيل الدخول">
      <form onSubmit={submit}>
        <label>البريد الإلكتروني</label>
        <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <label>كلمة المرور</label>
        <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <Button type="submit">دخول</Button>
      </form>
      <div className="links" style={{ marginTop: 10 }}>
        <Button variant="secondary" onClick={() => oauth('google')}>الدخول عبر Google</Button>
        <Button variant="secondary" onClick={() => oauth('linkedin_oidc')}>الدخول عبر LinkedIn</Button>
      </div>
      <p><Link href="/forgot-password">نسيت كلمة المرور؟</Link></p>
      {error ? <p style={{ color: '#991b1b' }}>{error}</p> : null}
    </Card>
  );
}
