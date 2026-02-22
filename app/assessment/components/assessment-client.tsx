'use client';
import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Toast } from '@/components/ui/toast';

type Item = { id: string; text_ar: string };
type ResponseMap = Record<string, { value: number; response_time_ms: number }>;

export default function AssessmentClient({ assessmentId, items, initialResponses }: { assessmentId: string; items: Item[]; initialResponses: ResponseMap }) {
  const router = useRouter();
  const [responses, setResponses] = useState<ResponseMap>(initialResponses);
  const [saving, setSaving] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [toast, setToast] = useState('');
  const [activeIndex, setActiveIndex] = useState(() => {
    const idx = items.findIndex((i) => !initialResponses[i.id]);
    return idx < 0 ? 0 : idx;
  });
  const [startedAt] = useState<Record<string, number>>(() => Object.fromEntries(items.map((i) => [i.id, Date.now()])));

  const answeredCount = useMemo(() => Object.keys(responses).length, [responses]);
  const pct = Math.round((answeredCount / Math.max(items.length, 1)) * 100);

  const saveResponse = async (itemId: string, value: number) => {
    const response_time_ms = Math.max(200, Date.now() - startedAt[itemId]);
    setSaving('saving');
    const res = await fetch('/api/responses', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ assessmentId, itemId, value, response_time_ms })
    });
    if (!res.ok) {
      setSaving('error');
      return setToast('فشل الحفظ التلقائي. حاول مرة أخرى.');
    }
    setResponses((prev) => ({ ...prev, [itemId]: { value, response_time_ms } }));
    setSaving('saved');
    setToast('تم حفظ الإجابة.');
    setActiveIndex((i) => Math.min(i + 1, items.length - 1));
  };

  const submit = async () => {
    const res = await fetch('/api/assessment/submit', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ assessmentId })
    });
    if (!res.ok) return setToast('تعذر إرسال التقييم.');
    router.push(`/results?assessmentId=${assessmentId}`);
  };

  if (!items.length) return <div className="card"><div className="skeleton" /><p className="muted">تحميل الأسئلة...</p></div>;
  const item = items[activeIndex];

  return (
    <>
      <div className="card">
        <p>السؤال {activeIndex + 1} من {items.length}</p>
        <div className="progress"><div style={{ width: `${pct}%` }} /></div>
        <p className="muted">الحالة: {saving === 'saving' ? 'جارٍ الحفظ...' : saving === 'saved' ? 'تم الحفظ' : saving === 'error' ? 'فشل الحفظ' : 'جاهز'}</p>
      </div>

      <div className="card">
        <h3>{item.text_ar}</h3>
        <p className="muted">اختر من 1 (لا أوافق بشدة) إلى 7 (أوافق بشدة)</p>
        <div className="grid grid-2">
          {[1, 2, 3, 4, 5, 6, 7].map((v) => (
            <Button key={v} variant={responses[item.id]?.value === v ? 'primary' : 'secondary'} onClick={() => saveResponse(item.id, v)} aria-label={`اختر ${v}`}>
              {v}
            </Button>
          ))}
        </div>
      </div>

      <div className="card">
        <div className="links">
          <Button variant="secondary" onClick={() => setActiveIndex((i) => Math.max(0, i - 1))}>السابق</Button>
          <Button variant="secondary" onClick={() => setActiveIndex((i) => Math.min(items.length - 1, i + 1))}>التالي</Button>
          <Button onClick={submit} disabled={answeredCount < items.length}>إرسال التقييم</Button>
        </div>
      </div>
      <Toast message={toast} type={saving === 'error' ? 'error' : 'success'} />
    </>
  );
}
