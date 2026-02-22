'use client';
import { useState } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  const reset = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.auth.updateUser({ password });
    if (error) return setError('فشل تحديث كلمة المرور.');
    setMsg('تم تحديث كلمة المرور بنجاح.');
  };

  return (
    <Card title="تعيين كلمة مرور جديدة">
      <form onSubmit={reset}>
        <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} />
        <Button type="submit">حفظ</Button>
      </form>
      {msg ? <p style={{ color: '#166534' }}>{msg}</p> : null}
      {error ? <p style={{ color: '#991b1b' }}>{error}</p> : null}
    </Card>
  );
}
