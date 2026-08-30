import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import StatCard from '../../components/common/StatCard';
import DataTable from '../../components/common/DataTable';
import StatusBadge from '../../components/common/StatusBadge';
import SearchBar from '../../components/common/SearchBar';
import Pagination from '../../components/common/Pagination';
import AddStaffModal from '../../components/staff/AddStaffModal';
import { staffApi } from '../../api/staffApi';

const PAGE_SIZE = 10;

export default function StaffList() {
  const navigate = useNavigate();
  const [staff, setStaff] = useState([]);
  const [stats, setStats] = useState(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchStats = useCallback(() => {
    staffApi.getStats?.()
      .then(setStats)
      .catch((err) => console.error('Failed to load staff stats:', err));
  }, []);

  const fetchStaff = useCallback(() => {
    setLoading(true);
    staffApi.list({ page, pageSize: PAGE_SIZE, search })
      .then(({ data, count }) => {
        setStaff(data || []);
        setTotal(count || 0);
      })
      .catch((err) => console.error('Failed to load staff list:', err))
      .finally(() => setLoading(false));
  }, [page, search]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    fetchStaff();
  }, [fetchStaff]);

  const handleStaffAdded = () => {
    fetchStaff();
    fetchStats();
  };

  const columns = [
    {
      key: 'name',
      label: 'Staff Member',
      render: (r) => (
        <div>
          <span className="font-medium text-gray-900">{r.name || r.full_name}</span>
          <p className="text-xs text-gray-500">{r.email}</p>
        </div>
      )
    },
    {
      key: 'role',
      label: 'Role',
      render: (r) => <span className="capitalize">{r.role?.replace('_', ' ')}</span>
    },
    {
      key: 'phone',
      label: 'Phone',
      render: (r) => r.phone || '—'
    },
    {
      key: 'status',
      label: 'Status',
      render: (r) => <StatusBadge status={r.status || 'active'} />
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Staff Directory</h2>
          <p className="text-gray-500 text-sm">Manage staff roles, schedules, and permissions.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors cursor-pointer"
        >
          <Plus size={16} /> Add Staff
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Total Staff" value={stats?.total ?? total ?? '—'} />
        <StatCard label="Active" value={stats?.active ?? total ?? '—'} />
        <StatCard label="On Leave" value={stats?.onLeave ?? '0'} />
      </div>

      <div className="bg-white border border-gray-200 rounded-xl">
        <div className="p-4 border-b border-gray-100">
          <SearchBar
            value={search}
            onChange={(v) => { setSearch(v); setPage(1); }}
            placeholder="Search staff members..."
          />
        </div>
        {loading ? (
          <p className="p-6 text-gray-400 text-sm">Loading staff...</p>
        ) : (
          <>
            <DataTable
              columns={columns}
              rows={staff}
              onRowClick={(r) => navigate(`/staff/${r.id}`)}
            />
            <Pagination page={page} pageSize={PAGE_SIZE} total={total} onPageChange={setPage} />
          </>
        )}
      </div>

      <AddStaffModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onStaffAdded={handleStaffAdded}
      />
    </div>
  );
}
