'use client';
import { useEffect, useState } from 'react';

export function Toast({ message, type = 'info' }: { message: string; type?: 'info' | 'success' | 'error' }) {
  const [show, setShow] = useState(Boolean(message));
  useEffect(() => {
    if (!message) return;
    setShow(true);
    const t = setTimeout(() => setShow(false), 2000);
    return () => clearTimeout(t);
  }, [message]);
  if (!show || !message) return null;
  return <div className={`toast toast-${type}`}>{message}</div>;
}
