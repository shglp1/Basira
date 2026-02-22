'use client';
import { useState } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Toast } from '@/components/ui/toast';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [toast, setToast] = useState('');
  const [error, setError] = useState('');

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`
    });
    if (error) return setError('تعذّر إرسال رابط الاستعادة. تأكد من البريد.');
    setToast('تم إرسال رابط الاستعادة إلى بريدك الإلكتروني.');
  };

  return (
    <>
      <Card title="استعادة كلمة المرور">
        <form onSubmit={send}>
          <label>البريد الإلكتروني</label>
          <Input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required />
          <Button type="submit">إرسال الرابط</Button>
          {error ? <p style={{ color: '#991b1b' }}>{error}</p> : null}
        </form>
      </Card>
      <Toast message={toast} type="success" />
    </>
  );
}
