import { supabase } from './supabaseClient';

export const trainerApi = {
  async getAll(selectQuery = '*') {
    const { data, error } = await supabase
      .from('trainers')
      .select(selectQuery)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async list({ page = 1, pageSize = 10, search = '' } = {}) {
    let query = supabase
      .from('trainers')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false });

    if (search) {
      query = query.or(`name.ilike.%${search}%,specialty.ilike.%${search}%,email.ilike.%${search}%`);
    }

    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    const { data, error, count } = await query.range(from, to);
    if (error) throw error;
    return { data, count };
  },

  async getById(id) {
    const { data, error } = await supabase
      .from('trainers')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  },

  async getAssignedMembers(trainerId) {
    const { data, error } = await supabase
      .from('members')
      .select('*')
      .eq('trainer_id', trainerId);
    if (error) return [];
    return data || [];
  },

  async create(payload) {
    const { data, error } = await supabase
      .from('trainers')
      .insert([payload])
      .select();
    if (error) throw error;
    return data?.[0];
  },

  async update(id, updates) {
    const { data, error } = await supabase
      .from('trainers')
      .update(updates)
      .eq('id', id)
      .select();
    if (error) throw error;
    return data?.[0];
  }
};
