import { supabase } from './supabaseClient';
import { createCrudApi } from './crudFactory';

const base = createCrudApi('leads');

export const leadApi = {
  ...base,
  async getStats() {
    const { count: total } = await supabase.from('leads').select('*', { count: 'exact', head: true });
    const startOfWeek = new Date(); startOfWeek.setDate(startOfWeek.getDate() - 7);
    const { count: newThisWeek } = await supabase.from('leads').select('*', { count: 'exact', head: true }).gte('created_at', startOfWeek.toISOString());
    const { count: converted } = await supabase.from('leads').select('*', { count: 'exact', head: true }).eq('status', 'converted');
    const conversionRate = total ? ((converted / total) * 100).toFixed(1) : 0;
    return { total, newThisWeek, conversionRate };
  },
  async markContacted(id) { return base.update(id, { status: 'contacted', last_contact: new Date().toISOString() }); },
  async convert(id) { return base.update(id, { status: 'converted' }); },
};
