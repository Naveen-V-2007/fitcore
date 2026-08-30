import { supabase } from './supabaseClient';
import { createCrudApi } from './crudFactory';

const base = createCrudApi('classes', `*, trainers(name)`);

export const classApi = {
  ...base,

  async getStats() {
    const startOfDay = new Date(); startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(); endOfDay.setHours(23, 59, 59, 999);
    const { count: todaysClasses } = await supabase.from('classes').select('*', { count: 'exact', head: true }).gte('scheduled_at', startOfDay.toISOString()).lte('scheduled_at', endOfDay.toISOString());
    const { data: all } = await supabase.from('classes').select('capacity, booked_count, status');
    const totalBookings = (all || []).reduce((s, c) => s + (c.booked_count || 0), 0);
    const availableSlots = (all || []).reduce((s, c) => s + Math.max(c.capacity - (c.booked_count || 0), 0), 0);
    const fullyBooked = (all || []).filter((c) => c.status === 'full').length;
    return { todaysClasses: todaysClasses || 0, totalBookings, availableSlots, fullyBooked };
  },

  async create(payload) {
    const insertPayload = {
      name: payload.name || payload.class_name || 'Untitled Class',
      trainer_id: payload.trainer_id || null,
      scheduled_at: payload.scheduled_at
        ? new Date(payload.scheduled_at).toISOString()
        : new Date().toISOString(),
      duration_minutes: payload.duration_minutes || 60,
      capacity: Number(payload.capacity) || 20,
      booked_count: 0,
      status: 'scheduled',
      room: payload.room || null,
    };

    const { data, error } = await supabase
      .from('classes')
      .insert([insertPayload])
      .select();

    if (error) throw error;
    return data?.[0];
  },

  async bookMember(classId, memberId) {
    const { error: be } = await supabase.from('class_bookings').insert({ class_id: classId, member_id: memberId });
    if (be) throw be;
    const { data: cls, error: fe } = await supabase.from('classes').select('capacity, booked_count').eq('id', classId).single();
    if (fe) throw fe;
    const newCount = (cls.booked_count || 0) + 1;
    const newStatus = newCount >= cls.capacity ? 'full' : 'scheduled';
    const { data, error } = await supabase.from('classes').update({ booked_count: newCount, status: newStatus }).eq('id', classId).select().single();
    if (error) throw error;
    return data;
  },

  async cancelBooking(classId, memberId) {
    const { error: de } = await supabase.from('class_bookings').delete().eq('class_id', classId).eq('member_id', memberId);
    if (de) throw de;
    const { data: cls, error: fe } = await supabase.from('classes').select('booked_count, status').eq('id', classId).single();
    if (fe) throw fe;
    const newCount = Math.max((cls.booked_count || 1) - 1, 0);
    const newStatus = cls.status === 'full' ? 'scheduled' : cls.status;
    const { data, error } = await supabase.from('classes').update({ booked_count: newCount, status: newStatus }).eq('id', classId).select().single();
    if (error) throw error;
    return data;
  },

  async getBookings(classId) {
    const { data, error } = await supabase.from('class_bookings').select('*, members(name, member_code, avatar_url)').eq('class_id', classId);
    if (error) throw error;
    return data;
  },
};
