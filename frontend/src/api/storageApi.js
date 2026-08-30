import { supabase } from './supabaseClient';

export const storageApi = {
  async uploadAvatar(file, folder = 'members') {
    const ext = file.name.split('.').pop();
    const fileName = `${folder}/${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage.from('avatars').upload(fileName, file, { cacheControl: '3600', upsert: false });
    if (error) throw error;
    const { data } = supabase.storage.from('avatars').getPublicUrl(fileName);
    return data.publicUrl;
  },
  async deleteAvatar(filePath) {
    const { error } = await supabase.storage.from('avatars').remove([filePath]);
    if (error) throw error;
  },
};
