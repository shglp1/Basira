import { Card } from '@/components/ui/card';
import { requireAdmin } from '@/lib/auth/guards';

export default async function AdminItemsPage() {
  const { supabase } = await requireAdmin();
  const { data: items } = await supabase.from('items').select('id,text_ar,version_id,trait_key,facet_key').limit(200);

  return (
    <Card title="بنك الأسئلة">
      <p className="muted">إدارة كاملة للأسئلة والمفاتيح السلوكية.</p>
      <ul>
        {(items ?? []).map((i: any) => <li key={i.id}>{i.version_id} | {i.trait_key} | {i.text_ar}</li>)}
      </ul>
    </Card>
  );
}
