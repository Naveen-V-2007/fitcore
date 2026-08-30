import { supabase } from './supabaseClient';
import { createCrudApi } from './crudFactory';

const base = createCrudApi('activity_log');

export const activityApi = {
  ...base,
  async getFeed({ category = 'all', unreadOnly = false, limit = 20 } = {}) {
    let query = supabase.from('activity_log').select('*').order('created_at', { ascending: false }).limit(limit);
    if (category !== 'all') query = query.eq('category', category);
    if (unreadOnly) query = query.eq('is_read', false);
    const { data, error } = await query;
    if (error) throw error;
    return data;
  },
  async getUnreadCount() {
    const { count, error } = await supabase.from('activity_log').select('*', { count: 'exact', head: true }).eq('is_read', false);
    if (error) throw error;
    return count || 0;
  },
  async markAllRead() {
    const { error } = await supabase.from('activity_log').update({ is_read: true }).eq('is_read', false);
    if (error) throw error;
  },
  async log(category, title, description) {
    const { error } = await supabase.from('activity_log').insert({ category, title, description });
    if (error) throw error;
  },
};
