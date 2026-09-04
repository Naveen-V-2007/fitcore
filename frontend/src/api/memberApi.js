import { supabase } from './supabaseClient';

export const memberApi = {
  async getAll(selectQuery = '*, membership_plans(id, name, price), trainers(id, name, specialty)') {
    const { data, error } = await supabase
      .from('members')
      .select(selectQuery)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async list({ page = 1, pageSize = 10, search = '' } = {}) {
    let query = supabase
      .from('members')
      .select('*, membership_plans(id, name, price), trainers(id, name, specialty)', { count: 'exact' })
      .order('created_at', { ascending: false });

    if (search) {
      query = query.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%,name.ilike.%${search}%,email.ilike.%${search}%`);
    }

    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    const { data, error, count } = await query.range(from, to);
    if (error) throw error;
    return { data, count };
  },

  async getById(id) {
    const { data, error } = await supabase
      .from('members')
      .select('*, membership_plans(id, name, price), trainers(id, name, specialty)')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  },

  async getFullProfile(id) {
    const [memberRes, paymentsRes, attendanceRes] = await Promise.all([
      supabase
        .from('members')
        .select('*, membership_plans(id, name, price, duration_months), trainers(id, name, specialty, email, phone)')
        .eq('id', id)
        .single(),
      supabase
        .from('payments')
        .select('*')
        .eq('member_id', id)
        .order('payment_date', { ascending: false }),
      supabase
        .from('attendance')
        .select('*')
        .eq('member_id', id)
        .order('check_in', { ascending: false })
    ]);

    if (memberRes.error) throw memberRes.error;

    return {
      ...memberRes.data,
      payments: paymentsRes.data || [],
      attendance: attendanceRes.data || []
    };
  },

  async getStats() {
    const { data, error } = await supabase.from('members').select('status, created_at');
    if (error) throw error;
    const total = data?.length || 0;
    const active = data?.filter((m) => m.status === 'active').length || 0;
    return { total, active, expiringSoon: 0, newThisMonth: total };
  },

  async create(payload) {
    const firstName = payload.first_name || '';
    const lastName = payload.last_name || '';
    const combinedName = `${firstName} ${lastName}`.trim() || payload.name || payload.full_name || 'Member';
    const memberCode = payload.member_code || `FT-${Math.floor(1000 + Math.random() * 9000)}`;

    const insertPayload = {
      member_code: memberCode,
      email: payload.email,
      phone: payload.phone || null,
      status: payload.status || 'active',
      first_name: firstName || combinedName,
      last_name: lastName,
      name: combinedName,
      full_name: combinedName,
      membership_plan_id: payload.membership_plan_id || null,
      trainer_id: payload.trainer_id || null
    };

    const { data, error } = await supabase
      .from('members')
      .insert([insertPayload])
      .select('*, membership_plans(id, name, price), trainers(id, name, specialty)');

    if (error) throw error;
    return data?.[0];
  },

  async update(id, updates) {
    const patch = { ...updates };
    if (updates.first_name || updates.last_name) {
      const combined = `${updates.first_name || ''} ${updates.last_name || ''}`.trim();
      patch.name = combined;
      patch.full_name = combined;
    }

    if ('membership_plan_id' in updates) {
      patch.membership_plan_id = updates.membership_plan_id || null;
    }

    if ('trainer_id' in updates) {
      patch.trainer_id = updates.trainer_id || null;
    }

    const { data, error } = await supabase
      .from('members')
      .update(patch)
      .eq('id', id)
      .select('*, membership_plans(id, name, price), trainers(id, name, specialty)');

    if (error) throw error;
    return data?.[0];
  }
};
