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

  async create(payload) {
    const staffCode = payload.staff_code || `ST-${Math.floor(100 + Math.random() * 900)}`;

    const insertPayload = {
      staff_code: staffCode,
      name: payload.full_name || payload.name || 'Staff Member',
      role_title: payload.role || payload.role_title || null,
      department: payload.department || null,
      email: payload.email || null,
      phone: payload.phone || null,
      status: (payload.status || 'active').toLowerCase(),
      join_date: payload.join_date || new Date().toISOString().slice(0, 10),
    };

    const { data, error } = await supabase
      .from('staff')
      .insert([insertPayload])
      .select();

    if (error) throw error;
    return data?.[0];
  },
};
