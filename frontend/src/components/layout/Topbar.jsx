import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Bell, HelpCircle, ChevronDown, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { activityApi } from '../../api/activityApi';
import { memberApi } from '../../api/memberApi';
import { trainerApi } from '../../api/trainerApi';

export default function Topbar({ placeholder = 'Search anything...' }) {
  const { profile, logout } = useAuth();
  const navigate = useNavigate();

  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);

  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState({ members: [], trainers: [] });
  const [searchOpen, setSearchOpen] = useState(false);

  const notifRef = useRef(null);
  const profileRef = useRef(null);
  const searchRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
      if (searchRef.current && !searchRef.current.contains(e.target)) setSearchOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  async function toggleNotifications() {
    if (!notifOpen) {
      try {
        const feed = await activityApi?.getFeed?.({ limit: 8 });
        setNotifications(feed || []);
      } catch (err) {
        console.error('Failed to load notifications:', err);
      }
    }
    setNotifOpen((prev) => !prev);
  }

  async function handleSearchChange(value) {
    setSearchTerm(value);
    if (value.trim().length < 2) {
      setSearchResults({ members: [], trainers: [] });
      setSearchOpen(false);
      return;
    }
    try {
      const [{ data: members }, { data: trainers }] = await Promise.all([
        memberApi.list({ page: 1, pageSize: 5, search: value }),
        trainerApi.list({ page: 1, pageSize: 5, search: value }),
      ]);
      setSearchResults({ members: members || [], trainers: trainers || [] });
      setSearchOpen(true);
    } catch (err) {
      console.error('Search error:', err);
    }
  }

  async function handleLogout() {
    if (logout) await logout();
    navigate('/login');
  }

  return (
    <header className="h-16 border-b border-gray-200 bg-white flex items-center justify-between px-6 gap-4 relative">
      <div className="relative flex-1 max-w-xl" ref={searchRef}>
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => handleSearchChange(e.target.value)}
          onFocus={() => searchTerm.trim().length >= 2 && setSearchOpen(true)}
          placeholder={placeholder}
          className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
        />

        {searchOpen && (
          <div className="absolute top-full mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-xl z-50 max-h-80 overflow-y-auto">
            {searchResults.members.length === 0 && searchResults.trainers.length === 0 ? (
              <p className="p-4 text-sm text-gray-400">No results found.</p>
            ) : (
              <>
                {searchResults.members.length > 0 && (
                  <div>
                    <p className="px-4 pt-3 pb-1 text-xs font-semibold text-gray-400 uppercase">Members</p>
                    {searchResults.members.map((m) => (
                      <button
                        key={m.id}
                        onClick={() => {
                          navigate(`/members/${m.id}`);
                          setSearchOpen(false);
                          setSearchTerm('');
                        }}
                        className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 cursor-pointer"
                      >
                        {m.name || `${m.first_name || ''} ${m.last_name || ''}`.trim() || m.email}
                      </button>
                    ))}
                  </div>
                )}
                {searchResults.trainers.length > 0 && (
                  <div>
                    <p className="px-4 pt-3 pb-1 text-xs font-semibold text-gray-400 uppercase">Trainers</p>
                    {searchResults.trainers.map((t) => (
                      <button
                        key={t.id}
                        onClick={() => {
                          navigate(`/trainers/${t.id}`);
                          setSearchOpen(false);
                          setSearchTerm('');
                        }}
                        className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 cursor-pointer"
                      >
                        {t.name || t.full_name || t.email}
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center gap-4">
        <div className="relative" ref={notifRef}>
          <button
            onClick={toggleNotifications}
            className="relative text-gray-500 hover:text-gray-700 cursor-pointer"
          >
            <Bell size={18} />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 rounded-full" />
          </button>

          {notifOpen && (
            <div className="absolute right-0 top-full mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-xl z-50 max-h-96 overflow-y-auto">
              <div className="px-4 py-3 border-b border-gray-100 font-semibold text-sm">Notifications</div>
              {notifications.length === 0 ? (
                <p className="p-4 text-sm text-gray-400">No notifications yet.</p>
              ) : (
                notifications.map((n) => (
                  <div key={n.id} className="px-4 py-3 border-b border-gray-50 last:border-0">
                    <p className="text-sm font-medium">{n.title}</p>
                    <p className="text-xs text-gray-500">{n.description}</p>
                  </div>
                ))
              )}
              <button
                onClick={() => {
                  navigate('/notifications');
                  setNotifOpen(false);
                }}
                className="w-full text-center py-2 text-xs font-semibold text-brand-600 hover:bg-gray-50 cursor-pointer"
              >
                View All
              </button>
            </div>
          )}
        </div>

        <a
          href="https://github.com/Naveen-V-2007/fitcore"
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-500 hover:text-gray-700 cursor-pointer"
          title="Help & Documentation"
        >
          <HelpCircle size={18} />
        </a>

        <div className="relative border-l border-gray-200 pl-4" ref={profileRef}>
          <button
            onClick={() => setProfileOpen((prev) => !prev)}
            className="flex items-center gap-2 cursor-pointer"
          >
            <div className="text-right">
              <p className="text-sm font-medium leading-tight">{profile?.full_name || 'Admin'}</p>
              <p className="text-xs text-gray-500 leading-tight capitalize">{profile?.role?.replace('_', ' ') || 'Admin'}</p>
            </div>
            <div className="w-9 h-9 rounded-full bg-brand-100 flex items-center justify-center text-brand-900 font-semibold text-sm">
              {(profile?.full_name || 'A').charAt(0)}
            </div>
            <ChevronDown size={14} className="text-gray-400" />
          </button>

          {profileOpen && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-xl z-50">
              <div className="px-4 py-3 border-b border-gray-100">
                <p className="text-sm font-medium">{profile?.full_name || 'Admin'}</p>
                <p className="text-xs text-gray-500 capitalize">{profile?.role || 'admin'}</p>
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 cursor-pointer"
              >
                <LogOut size={14} /> Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
