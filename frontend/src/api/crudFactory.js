import { supabase } from './supabaseClient';

export function createCrudApi(table, selectQuery = '*') {
  return {
    async list({ page = 1, pageSize = 10, search = '', searchColumn = 'name', filters = {} } = {}) {
      let query = supabase.from(table).select(selectQuery, { count: 'exact' });
      if (search) query = query.ilike(searchColumn, `%${search}%`);
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== 'all') query = query.eq(key, value);
      });
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      query = query.range(from, to).order('created_at', { ascending: false });
      const { data, error, count } = await query;
      if (error) throw error;
      return { data, count };
    },
    async getById(id) {
      const { data, error } = await supabase.from(table).select(selectQuery).eq('id', id).single();
      if (error) throw error;
      return data;
    },
    async create(payload) {
      const { data, error } = await supabase.from(table).insert(payload).select().single();
      if (error) throw error;
      return data;
    },
    async update(id, payload) {
      const { data, error } = await supabase.from(table).update(payload).eq('id', id).select().single();
      if (error) throw error;
      return data;
    },
    async remove(id) {
      const { error } = await supabase.from(table).delete().eq('id', id);
      if (error) throw error;
      return true;
    },
  };
}
