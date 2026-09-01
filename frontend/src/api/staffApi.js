import { supabase } from './supabaseClient';
import { createCrudApi } from './crudFactory';

const base = createCrudApi('staff');

export const staffApi = {
  ...base,

  async getStats() {
    const { count: total } = await supabase.from('staff').select('*', { count: 'exact', head: true });
    const { count: active } = await supabase.from('staff').select('*', { count: 'exact', head: true }).eq('status', 'active');
    const { count: onLeave } = await supabase.from('staff').select('*', { count: 'exact', head: true }).eq('status', 'on_leave');
    
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    const { count: newThisMonth } = await supabase
      .from('staff')
      .select('*', { count: 'exact', head: true })
      .gte('join_date', startOfMonth.toISOString().slice(0, 10));

    return { 
      total: total || 0, 
      active: active || 0, 
      onLeave: onLeave || 0, 
      newThisMonth: newThisMonth || 0 
    };
  },

  async create(payload) {
    const staffCode = payload.staff_code || `ST-${Math.floor(100 + Math.random() * 900)}`;
    const staffName = payload.full_name || payload.name || `${payload.first_name || ''} ${payload.last_name || ''}`.trim() || 'Staff Member';
    const roleValue = payload.role || payload.role_title || 'Front Desk';

    const insertPayload = {
      staff_code: staffCode,
      name: staffName,
      role: roleValue,
      role_title: roleValue,
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

  async update(id, updates) {
    const patch = { ...updates };

    if (updates.name || updates.full_name || updates.first_name) {
      const combined = updates.name || updates.full_name || `${updates.first_name || ''} ${updates.last_name || ''}`.trim();
      patch.name = combined;
    }

    if (updates.role || updates.role_title) {
      const roleVal = updates.role || updates.role_title;
      patch.role = roleVal;
      patch.role_title = roleVal;
    }

    if (updates.status) {
      patch.status = updates.status.toLowerCase();
    }

    const { data, error } = await supabase
      .from('staff')
      .update(patch)
      .eq('id', id)
      .select();

    if (error) throw error;
    return data?.[0];
  }
};
