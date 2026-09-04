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
      query = query.or(
        `name.ilike.%${search}%,first_name.ilike.%${search}%,last_name.ilike.%${search}%,specialization.ilike.%${search}%,specialty.ilike.%${search}%,email.ilike.%${search}%`
      );
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
      .select('id, name, first_name, last_name, email, phone, status, created_at, membership_plan_id')
      .eq('trainer_id', trainerId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching assigned members:', error);
      return [];
    }

    return (data || []).map((m) => ({
      ...m,
      name: m.name || `${m.first_name || ''} ${m.last_name || ''}`.trim() || m.email,
    }));
  },

  async getFullProfile(id) {
    const [trainerRes, members] = await Promise.all([
      supabase.from('trainers').select('*').eq('id', id).single(),
      this.getAssignedMembers(id),
    ]);

    if (trainerRes.error) throw trainerRes.error;

    return {
      ...trainerRes.data,
      members: members || [],
      totalClients: (members || []).length,
      activeClients: (members || []).filter((m) => m.status === 'active').length,
    };
  },

  async getStats() {
    const { data, error } = await supabase.from('trainers').select('status');
    if (error) throw error;

    const total = data?.length || 0;
    const active = data?.filter((t) => t.status === 'active').length || 0;
    return { total, active };
  },

  async create(payload) {
    const firstName = payload.first_name || '';
    const lastName = payload.last_name || '';
    const combinedName =
      payload.name || `${firstName} ${lastName}`.trim() || payload.full_name || 'Trainer';
    const trainerCode = payload.trainer_code || `TR-${Math.floor(100 + Math.random() * 900)}`;
    const specialtyValue = payload.specialty || payload.specialization || 'General Fitness';

    const insertPayload = {
      trainer_code: trainerCode,
      name: combinedName,
      full_name: combinedName,
      first_name: firstName,
      last_name: lastName,
      specialty: specialtyValue,
      specialization: specialtyValue,
      phone: payload.phone || null,
      email: payload.email || null,
      bio: payload.bio || null,
      status: (payload.status || 'active').toLowerCase(),
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

    if (updates.first_name || updates.last_name || updates.name) {
      const combined =
        updates.name || `${updates.first_name || ''} ${updates.last_name || ''}`.trim();
      patch.name = combined;
      patch.full_name = combined;
    }

    if (updates.specialty || updates.specialization) {
      const spec = updates.specialty || updates.specialization;
      patch.specialty = spec;
      patch.specialization = spec;
    }

    if (updates.status) {
      patch.status = updates.status.toLowerCase();
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
