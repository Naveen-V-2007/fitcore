import { supabase } from './supabaseClient';
import { createCrudApi } from './crudFactory';

const base = createCrudApi('membership_plans');

export const membershipApi = {
  ...base,
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
