import { supabase } from './supabaseClient';
import { createCrudApi } from './crudFactory';

const base = createCrudApi('membership_plans');

export const membershipApi = {
  ...base,

  async create(payload) {
    const planCode = payload.plan_code || `PLN-${Math.floor(100 + Math.random() * 900)}`;
    const durationMonths = Number(payload.duration_months) || 1;

    const insertPayload = {
      plan_code: planCode,
      name: payload.name,
      price: Number(payload.price) || 0,
      duration_days: durationMonths * 30,
      renewal_rate: 0,
      status: payload.is_active === false ? 'inactive' : 'active',
      features: payload.description ? [payload.description] : [],
    };

    const { data, error } = await supabase
      .from('membership_plans')
      .insert([insertPayload])
      .select();

    if (error) throw error;
    return data?.[0];
  },

  async getStats() {
    const { count: activePlans } = await supabase.from('membership_plans').select('*', { count: 'exact', head: true }).eq('status', 'active');
    const { count: activeSubscriptions } = await supabase.from('members').select('*', { count: 'exact', head: true }).eq('status', 'active');
    const { data: payments } = await supabase.from('payments').select('amount').eq('status', 'paid');
    const monthlyRecurringRevenue = (payments || []).reduce((s, p) => s + Number(p.amount), 0);
    return { activePlans, activeSubscriptions, monthlyRecurringRevenue };
  },

  async getFullProfile(id) {
    const { data: plan, error } = await supabase.from('membership_plans').select('*').eq('id', id).single();
    if (error) throw error;
    const { data: members, count } = await supabase.from('members').select('id, name, join_date, expiry_date, status', { count: 'exact' }).eq('plan_id', id).order('join_date', { ascending: false });
    return { ...plan, members: members || [], activeMemberCount: count || 0 };
  },
};
