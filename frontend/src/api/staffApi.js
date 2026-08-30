import { supabase } from './supabaseClient';
import { createCrudApi } from './crudFactory';

const base = createCrudApi('staff');

export const staffApi = {
  ...base,
  async getStats() {
    const { count: total } = await supabase.from('staff').select('*', { count: 'exact', head: true });
    const { count: active } = await supabase.from('staff').select('*', { count: 'exact', head: true }).eq('status', 'active');
    const { count: onLeave } = await supabase.from('staff').select('*', { count: 'exact', head: true }).eq('status', 'on_leave');
    const startOfMonth = new Date(); startOfMonth.setDate(1);
    const { count: newThisMonth } = await supabase.from('staff').select('*', { count: 'exact', head: true }).gte('join_date', startOfMonth.toISOString().slice(0, 10));
    return { total, active, onLeave, newThisMonth };
  },
};
