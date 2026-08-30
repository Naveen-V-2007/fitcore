import { supabase } from './supabaseClient';

export const reportApi = {
  async getSummary() {
    const { data: payments } = await supabase.from('payments').select('amount, status');
    const totalRevenue = (payments || []).filter((p) => p.status === 'paid').reduce((s, p) => s + Number(p.amount), 0);
    const { count: memberGrowth } = await supabase.from('members').select('*', { count: 'exact', head: true }).gte('join_date', new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10));
    const { data: classes } = await supabase.from('classes').select('capacity, booked_count');
    const totalCapacity = (classes || []).reduce((s, c) => s + c.capacity, 0);
    const totalBooked = (classes || []).reduce((s, c) => s + (c.booked_count || 0), 0);
    const classAttendance = totalCapacity ? Math.round((totalBooked / totalCapacity) * 100) : 0;
    const { count: totalLeads } = await supabase.from('leads').select('*', { count: 'exact', head: true });
    const { count: convertedLeads } = await supabase.from('leads').select('*', { count: 'exact', head: true }).eq('status', 'converted');
    const leadConversion = totalLeads ? Math.round((convertedLeads / totalLeads) * 100) : 0;
    return { totalRevenue, memberGrowth, classAttendance, leadConversion };
  },
  async getRevenueTrend(days = 7) {
    const since = new Date(); since.setDate(since.getDate() - days);
    const { data, error } = await supabase.from('payments').select('amount, paid_at').eq('status', 'paid').gte('paid_at', since.toISOString());
    if (error) throw error;
    const grouped = {};
    (data || []).forEach((p) => { const day = new Date(p.paid_at).toLocaleDateString('en-US', { weekday: 'short' }); grouped[day] = (grouped[day] || 0) + Number(p.amount); });
    return Object.entries(grouped).map(([day, total]) => ({ day, total }));
  },
  async getMembershipDistribution() {
    const { data, error } = await supabase.from('members').select('membership_plans(name)').eq('status', 'active');
    if (error) throw error;
    const counts = {};
    (data || []).forEach((m) => { const plan = m.membership_plans?.name || 'Unknown'; counts[plan] = (counts[plan] || 0) + 1; });
    const total = Object.values(counts).reduce((a, b) => a + b, 0);
    return Object.entries(counts).map(([plan, count]) => ({ plan, count, percent: total ? Math.round((count / total) * 100) : 0 }));
  },
  async getTopTrainers(limit = 3) {
    const { data, error } = await supabase.from('trainers').select('id, name, members(count)').limit(limit);
    if (error) throw error;
    return data;
  },
};
