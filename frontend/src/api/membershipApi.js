import { supabase } from './supabaseClient';
import { createCrudApi } from './crudFactory';

const base = createCrudApi('membership_plans');

export const membershipApi = {
  ...base,

  async getAll(selectQuery = '*') {
    const { data, error } = await supabase
      .from('membership_plans')
      .select(selectQuery)
      .order('price', { ascending: true });
    if (error) throw error;
    return data;
  },

  async create(payload) {
    const planCode = payload.plan_code || `PLN-${Math.floor(100 + Math.random() * 900)}`;
    const durationMonths = Number(payload.duration_months) || 1;

    const insertPayload = {
      plan_code: planCode,
      name: payload.name,
      price: Number(payload.price) || 0,
      duration_months: durationMonths,
      duration_days: Number(payload.duration_days) || durationMonths * 30,
      renewal_rate: Number(payload.renewal_rate) || 0,
      status: payload.is_active === false || payload.status === 'inactive' ? 'inactive' : 'active',
      description: payload.description || null,
      features: Array.isArray(payload.features)
        ? payload.features
        : payload.description
        ? [payload.description]
        : [],
    };

    const { data, error } = await supabase
      .from('membership_plans')
      .insert([insertPayload])
      .select();

    if (error) throw error;
    return data?.[0];
  },

  async update(id, updates) {
    const patch = { ...updates };

    if (updates.duration_months && !updates.duration_days) {
      patch.duration_days = Number(updates.duration_months) * 30;
    }
    if (updates.price !== undefined) {
      patch.price = Number(updates.price);
    }
    if (updates.description && !updates.features) {
      patch.features = [updates.description];
    }
    if (updates.status) {
      patch.status = updates.status.toLowerCase();
    }

    const { data, error } = await supabase
      .from('membership_plans')
      .update(patch)
      .eq('id', id)
      .select();

    if (error) throw error;
    return data?.[0];
  },

  async getStats() {
    const { count: activePlans } = await supabase
      .from('membership_plans')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active');

    const { count: activeSubscriptions } = await supabase
      .from('members')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active');

    const { data: payments } = await supabase
      .from('payments')
      .select('amount')
      .or('status.eq.paid,status.eq.completed');

    const monthlyRecurringRevenue = (payments || []).reduce((s, p) => s + Number(p.amount || 0), 0);

    return {
      activePlans: activePlans || 0,
      activeSubscriptions: activeSubscriptions || 0,
      monthlyRecurringRevenue: monthlyRecurringRevenue || 0,
    };
  },

  async getFullProfile(id) {
    const { data: plan, error } = await supabase
      .from('membership_plans')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;

    // Check both membership_plan_id and plan_id to support either column schema
    let { data: members, error: membersError } = await supabase
      .from('members')
      .select('id, name, first_name, last_name, email, created_at, status, membership_plan_id')
      .eq('membership_plan_id', id)
      .order('created_at', { ascending: false });

    if (membersError || !members?.length) {
      const fallback = await supabase
        .from('members')
        .select('id, name, first_name, last_name, email, created_at, status')
        .eq('plan_id', id)
        .order('created_at', { ascending: false });

      if (!fallback.error && fallback.data?.length) {
        members = fallback.data;
      }
    }

    const resolvedMembers = (members || []).map((m) => ({
      ...m,
      name: m.name || `${m.first_name || ''} ${m.last_name || ''}`.trim() || m.email,
    }));

    const activeCount = resolvedMembers.filter((m) => m.status === 'active').length;

    return {
      ...plan,
      members: resolvedMembers,
      activeMemberCount: activeCount,
    };
  },
};
