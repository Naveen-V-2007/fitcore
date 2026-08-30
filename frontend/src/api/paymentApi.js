import { supabase } from './supabaseClient';
import { createCrudApi } from './crudFactory';

const base = createCrudApi('payments', `*, members(name, email), membership_plans(name)`);

export const paymentApi = {
  ...base,
  async getStats() {
    const { data: all } = await supabase.from('payments').select('amount, status, paid_at');
    if (!all) return { totalRevenue: 0, totalMonth: 0, pending: 0, refunds: 0 };
    const totalRevenue = all.filter((p) => p.status === 'paid').reduce((s, p) => s + Number(p.amount), 0);
    const now = new Date();
    const totalMonth = all.filter((p) => { const d = new Date(p.paid_at); return p.status === 'paid' && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear(); }).reduce((s, p) => s + Number(p.amount), 0);
    const pending = all.filter((p) => p.status === 'pending').reduce((s, p) => s + Number(p.amount), 0);
    const refunds = all.filter((p) => p.status === 'refunded').reduce((s, p) => s + Number(p.amount), 0);
    return { totalRevenue, totalMonth, pending, refunds };
  },
  async markPaid(id) { return base.update(id, { status: 'paid', paid_at: new Date().toISOString() }); },
  async markFailed(id) { return base.update(id, { status: 'failed' }); },
  async refund(id) { return base.update(id, { status: 'refunded' }); },
};
