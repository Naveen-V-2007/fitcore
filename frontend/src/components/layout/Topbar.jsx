import { Search, Bell, HelpCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Topbar({ placeholder = 'Search anything...' }) {
  const { profile } = useAuth();

  return (
    <header className="h-16 border-b border-gray-200 bg-white flex items-center justify-between px-6 gap-4">
      <div className="relative flex-1 max-w-xl">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder={placeholder}
          className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
        />
      </div>

      <div className="flex items-center gap-4">
        <button className="relative text-gray-500 hover:text-gray-700">
          <Bell size={18} />
          <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 rounded-full" />
        </button>
        <button className="text-gray-500 hover:text-gray-700">
          <HelpCircle size={18} />
        </button>
        <div className="flex items-center gap-2 border-l border-gray-200 pl-4">
          <div className="text-right">
            <p className="text-sm font-medium leading-tight">{profile?.full_name || 'Admin'}</p>
            <p className="text-xs text-gray-500 leading-tight capitalize">{profile?.role?.replace('_', ' ') || 'Admin'}</p>
          </div>
          <div className="w-9 h-9 rounded-full bg-brand-100 flex items-center justify-center text-brand-900 font-semibold text-sm">
            {(profile?.full_name || 'A').charAt(0)}
          </div>
        </div>
      </div>
    </header>
  );
}
