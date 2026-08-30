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
      query = query.or(`name.ilike.%${search}%,specialization.ilike.%${search}%,email.ilike.%${search}%`);
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
    const firstName = payload.first_name || '';
    const lastName = payload.last_name || '';
    const combinedName = `${firstName} ${lastName}`.trim() || payload.name || 'Trainer';
    const trainerCode = payload.trainer_code || `TR-${Math.floor(100 + Math.random() * 900)}`;

    const insertPayload = {
      trainer_code: trainerCode,
      name: combinedName,
      first_name: firstName,
      last_name: lastName,
      specialization: payload.specialty || payload.specialization || '',
      phone: payload.phone || null,
      email: payload.email || null,
      bio: payload.bio || null,
      status: payload.status || 'active',
    };

    const { data, error } = await supabase
      .from('trainers')
      .insert([insertPayload])
      .select();

    if (error) throw error;
    return data?.[0];
  },

  async update(id, updates) {
    const patch = { ...updates };
    if (updates.first_name || updates.last_name) {
      patch.name = `${updates.first_name || ''} ${updates.last_name || ''}`.trim();
    }
    if (updates.specialty) {
      patch.specialization = updates.specialty;
      delete patch.specialty;
    }

    const { data, error } = await supabase
      .from('trainers')
      .update(patch)
      .eq('id', id)
      .select();

    if (error) throw error;
    return data?.[0];
  }
};
