import { useState } from 'react';
import logo from '../../../assets/logo.png';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutGrid,
  Users,
  Dumbbell,
  CreditCard,
  ClipboardCheck,
  Wallet,
  Calendar,
  Briefcase,
  UserPlus,
  BarChart3,
  Settings as SettingsIcon,
  Plus,
  LogOut,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import AddMemberModal from '../members/AddMemberModal';

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutGrid },
  { to: '/members', label: 'Members', icon: Users },
  { to: '/trainers', label: 'Trainers', icon: Dumbbell },
  { to: '/memberships', label: 'Memberships', icon: CreditCard },
  { to: '/attendance', label: 'Attendance', icon: ClipboardCheck },
  { to: '/payments', label: 'Payments', icon: Wallet },
  { to: '/classes', label: 'Classes', icon: Calendar },
  { to: '/staff', label: 'Staff', icon: Briefcase },
  { to: '/leads', label: 'Leads', icon: UserPlus },
  { to: '/reports', label: 'Reports', icon: BarChart3 },
  { to: '/settings', label: 'Settings', icon: SettingsIcon },
];

export default function Sidebar() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleMemberAdded = () => {
    setIsAddModalOpen(false);
    navigate('/members');
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <>
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col h-screen">
        <div className="px-6 py-5 flex items-center gap-2">
           <img src={logo} alt="FitCore" className="w-8 h-8 rounded-lg object-cover" />
           <div>
              <h1 className="text-xl font-bold text-gray-900">FitCore</h1>
              <p className="text-xs text-gray-500">Gym Management</p>
            </div>
          </div>

        <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                  isActive
                    ? 'bg-brand-100 text-brand-900 border-l-4 border-brand-500 -ml-1 pl-4'
                    : 'text-gray-600 hover:bg-gray-50'
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 space-y-2">
          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="w-full flex items-center justify-center gap-2 bg-brand-500 hover:bg-brand-600 text-white font-medium text-sm py-2.5 rounded-lg transition cursor-pointer shadow-sm"
          >
            <Plus size={16} /> Add Member
          </button>

          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 border border-gray-300 text-gray-600 hover:bg-gray-50 font-medium text-sm py-2.5 rounded-lg transition cursor-pointer"
          >
            <LogOut size={16} /> Sign Out
          </button>
        </div>
      </aside>

      <AddMemberModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onMemberAdded={handleMemberAdded}
      />
    </>
  );
}
