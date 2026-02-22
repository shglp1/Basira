'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } }
    });
    if (error) return setError(error.message);
    router.push('/dashboard');
    router.refresh();
  };

  return (
    <main>
      <div className="card">
        <h2>إنشاء حساب</h2>
        <form onSubmit={onSubmit}>
          <input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="الاسم" required />
          <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" required />
          <input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" type="password" required />
          <button className="btn" type="submit">تسجيل</button>
        </form>
        {error ? <p>{error}</p> : null}
      </div>
    </main>
  );
}
