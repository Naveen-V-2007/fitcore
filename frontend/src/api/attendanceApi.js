import { supabase } from './supabaseClient';

export const attendanceApi = {
  async getAll() {
    const { data, error } = await supabase
      .from('attendance')
      .select(`
        id,
        member_id,
        check_in,
        check_out,
        created_at,
        members:member_id (
          first_name,
          last_name,
          email
        )
      `)
      .order('check_in', { ascending: false });
    if (error) throw error;
    return data;
  },

  async list({ page = 1, pageSize = 50 } = {}) {
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    const { data, error, count } = await supabase
      .from('attendance')
      .select(`
        id,
        member_id,
        check_in,
        check_out,
        created_at,
        members:member_id (
          first_name,
          last_name,
          email
        )
      `, { count: 'exact' })
      .order('check_in', { ascending: false })
      .range(from, to);
    if (error) throw error;
    return { data, count };
  },

  async getStats() {
    const today = new Date().toISOString().split('T')[0];
    const { data, error } = await supabase
      .from('attendance')
      .select('check_in, check_out')
      .gte('check_in', `${today}T00:00:00`);
    if (error) throw error;

    const total = data?.length || 0;
    const inside = data?.filter((r) => !r.check_out).length || 0;
    return { total, inside, completed: total - inside };
  },

  async checkIn(memberId) {
    const { data, error } = await supabase
      .from('attendance')
      .insert([{ member_id: memberId, check_in: new Date().toISOString() }])
      .select(`
        id,
        member_id,
        check_in,
        check_out,
        created_at,
        members:member_id (
          first_name,
          last_name,
          email
        )
      `);
    if (error) throw error;
    return data?.[0];
  },

  async checkOut(attendanceId) {
    const { data, error } = await supabase
      .from('attendance')
      .update({ check_out: new Date().toISOString() })
      .eq('id', attendanceId)
      .select();
    if (error) throw error;
    return data?.[0];
  }
};
