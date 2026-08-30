import { useState } from 'react';
import { Camera, Loader2 } from 'lucide-react';
import { storageApi } from '../../api/storageApi';

export default function AvatarUpload({ currentUrl, onUploaded }) {
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `members/${fileName}`;

      const publicUrl = await storageApi.uploadAvatar(filePath, file);
      if (onUploaded) onUploaded(publicUrl);
    } catch (err) {
      console.error('Avatar upload failed:', err);
      alert('Error uploading avatar image');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="relative w-20 h-20 mx-auto mb-4">
      <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-100 border-2 border-gray-200 flex items-center justify-center shadow-inner">
        {currentUrl ? (
          <img src={currentUrl} alt="Avatar" className="w-full h-full object-cover" />
        ) : (
          <span className="text-2xl font-bold text-gray-400">?</span>
        )}
      </div>

      <label className="absolute bottom-0 right-0 p-1.5 bg-[#84c22a] hover:bg-[#72a823] text-white rounded-full cursor-pointer shadow-md transition-colors">
        {uploading ? <Loader2 size={14} className="animate-spin" /> : <Camera size={14} />}
        <input
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
          disabled={uploading}
        />
      </label>
    </div>
  );
}
