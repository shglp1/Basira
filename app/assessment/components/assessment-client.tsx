'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

type Item = { id: string; text_ar: string };
type ResponseMap = Record<string, { value: number; response_time_ms: number }>;

export default function AssessmentClient({ assessmentId, items, initialResponses }: { assessmentId: string; items: Item[]; initialResponses: ResponseMap }) {
  const router = useRouter();
  const [responses, setResponses] = useState<ResponseMap>(initialResponses);
  const [startedAt] = useState<Record<string, number>>(() => Object.fromEntries(items.map((i) => [i.id, Date.now()])));
  const answeredCount = useMemo(() => Object.keys(responses).length, [responses]);

  const saveResponse = async (itemId: string, value: number) => {
    const response_time_ms = Math.max(200, Date.now() - startedAt[itemId]);
    await fetch('/api/responses', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ assessmentId, itemId, value, response_time_ms })
    });
    setResponses((prev) => ({ ...prev, [itemId]: { value, response_time_ms } }));
  };

  const submit = async () => {
    await fetch('/api/assessment/submit', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ assessmentId })
    });
    router.push(`/results?assessmentId=${assessmentId}`);
    router.refresh();
  };

  const pct = Math.round((answeredCount / Math.max(items.length, 1)) * 100);

  return (
    <div className="card">
      <p>التقدم: {answeredCount} / {items.length}</p>
      <div className="progress"><div style={{ width: `${pct}%` }} /></div>
      {items.map((item) => (
        <div key={item.id} style={{ marginTop: 16 }}>
          <p>{item.text_ar}</p>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {[1,2,3,4,5,6,7].map((v) => (
              <button key={v} type="button" className="btn" onClick={() => saveResponse(item.id, v)} style={{ opacity: responses[item.id]?.value === v ? 1 : 0.6 }}>{v}</button>
            ))}
          </div>
        </div>
      ))}

      <button className="btn" type="button" onClick={submit} style={{ marginTop: 16 }}>إرسال التقييم</button>
    </div>
  );
}
