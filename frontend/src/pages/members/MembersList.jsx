import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import StatCard from '../../components/common/StatCard';
import DataTable from '../../components/common/DataTable';
import StatusBadge from '../../components/common/StatusBadge';
import SearchBar from '../../components/common/SearchBar';
import Pagination from '../../components/common/Pagination';
import AddMemberModal from '../../components/members/AddMemberModal';
import { memberApi } from '../../api/memberApi';

const PAGE_SIZE = 10;

export default function MembersList() {
  const navigate = useNavigate();
  const [members, setMembers] = useState([]);
  const [stats, setStats] = useState(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchStats = useCallback(() => {
    memberApi.getStats?.()
      .then(setStats)
      .catch((err) => console.error('Failed to load member stats:', err));
  }, []);

  const fetchMembers = useCallback(() => {
    setLoading(true);
    memberApi.list({ page, pageSize: PAGE_SIZE, search })
      .then(({ data, count }) => {
        setMembers(data || []);
        setTotal(count || 0);
      })
      .catch((err) => console.error('Failed to load members:', err))
      .finally(() => setLoading(false));
  }, [page, search]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  const handleMemberAdded = () => {
    fetchMembers();
    fetchStats();
  };

  const columns = [
    {
      key: 'name',
      label: 'Member',
      render: (r) => (
        <span className="font-medium text-gray-900">
          {r.name || `${r.first_name || ''} ${r.last_name || ''}`.trim() || '—'}
        </span>
      )
    },
    {
      key: 'member_code',
      label: 'Member ID',
      render: (r) => r.member_code || r.id?.slice(0, 8) || '—'
    },
    {
      key: 'plan',
      label: 'Membership',
      render: (r) => r.membership_plans?.name || 'Standard'
    },
    {
      key: 'email',
      label: 'Contact',
      render: (r) => r.email || r.phone || '—'
    },
    {
      key: 'joined_date',
      label: 'Join Date',
      render: (r) => new Date(r.joined_date || r.created_at || Date.now()).toLocaleDateString()
    },
    {
      key: 'trainer',
      label: 'Trainer',
      render: (r) => r.trainers?.name || (r.trainers?.first_name ? `${r.trainers.first_name} ${r.trainers.last_name || ''}`.trim() : '—')
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
          <h2 className="text-2xl font-bold">Members</h2>
          <p className="text-gray-500 text-sm">Manage gym members and member information.</p>
        </div>
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-[#84c22a] hover:bg-[#72a823] text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors cursor-pointer shadow-sm"
        >
          <Plus size={16} /> Add Member
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <StatCard label="Total Members" value={stats?.total ?? total ?? '—'} />
        <StatCard label="Active Members" value={stats?.active ?? total ?? '—'} />
        <StatCard label="New This Month" value={stats?.newThisMonth ?? '0'} />
        <StatCard label="Expiring Soon" value={stats?.expiringSoon ?? '0'} />
      </div>

      <div className="bg-white border border-gray-200 rounded-xl">
        <div className="p-4 border-b border-gray-100">
          <SearchBar
            value={search}
            onChange={(v) => { setSearch(v); setPage(1); }}
            placeholder="Search members..."
          />
        </div>
        {loading ? (
          <p className="p-6 text-gray-400 text-sm">Loading members...</p>
        ) : (
          <>
            <DataTable
              columns={columns}
              rows={members}
              onRowClick={(r) => navigate(`/members/${r.id}`)}
            />
            <Pagination page={page} pageSize={PAGE_SIZE} total={total} onPageChange={setPage} />
          </>
        )}
      </div>

      <AddMemberModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onMemberAdded={handleMemberAdded}
      />
    </div>
  );
}
