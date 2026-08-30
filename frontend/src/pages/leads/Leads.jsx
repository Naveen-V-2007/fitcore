import { useEffect, useState, useCallback } from 'react';
import { Plus, Phone } from 'lucide-react';
import StatCard from '../../components/common/StatCard';
import DataTable from '../../components/common/DataTable';
import StatusBadge from '../../components/common/StatusBadge';
import SearchBar from '../../components/common/SearchBar';
import Pagination from '../../components/common/Pagination';
import AddLeadModal from '../../components/leads/AddLeadModal';
import { leadApi } from '../../api/leadApi';

const PAGE_SIZE = 10;

export default function Leads() {
  const [leads, setLeads] = useState([]);
  const [stats, setStats] = useState(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchStats = useCallback(() => {
    leadApi.getStats?.()
      .then(setStats)
      .catch((err) => console.error('Failed to load lead stats:', err));
  }, []);

  const fetchLeads = useCallback(() => {
    setLoading(true);
    leadApi.list({ page, pageSize: PAGE_SIZE, search })
      .then(({ data, count }) => {
        setLeads(data || []);
        setTotal(count || 0);
      })
      .catch((err) => console.error('Failed to load leads:', err))
      .finally(() => setLoading(false));
  }, [page, search]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  const handleLeadAdded = () => {
    fetchLeads();
    fetchStats();
  };

  const columns = [
    {
      key: 'name',
      label: 'Name',
      render: (r) => (
        <div>
          <p className="font-medium">{r.name || r.full_name || '—'}</p>
          <p className="text-xs text-gray-500">{r.email || r.phone || '—'}</p>
        </div>
      )
    },
    {
      key: 'source',
      label: 'Source',
      render: (r) => <span className="capitalize">{(r.source || 'Website').replace('_', ' ')}</span>
    },
    {
      key: 'interest',
      label: 'Interest',
      render: (r) => r.interest || r.notes || 'General'
    },
    {
      key: 'last_contact',
      label: 'Last Contact',
      render: (r) => new Date(r.last_contact || r.created_at || Date.now()).toLocaleDateString()
    },
    {
      key: 'status',
      label: 'Status',
      render: (r) => <StatusBadge status={r.status || 'new'} />
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (r) => (
        r.phone ? (
          <a href={`tel:${r.phone}`} className="inline-flex hover:text-brand-500 transition-colors">
            <Phone size={14} className="text-gray-400 hover:text-brand-500" />
          </a>
        ) : (
          <Phone size={14} className="text-gray-300" />
        )
      )
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Leads</h2>
          <p className="text-gray-500 text-sm">Manage and track potential gym members.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors cursor-pointer"
        >
          <Plus size={16} /> Add Lead
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <StatCard label="Total Leads" value={stats?.total ?? total ?? '—'} />
        <StatCard label="New This Week" value={stats?.newThisWeek ?? '—'} />
        <StatCard label="Conversion Rate" value={`${stats?.conversionRate ?? 0}%`} />
        <StatCard label="Follow-ups Needed" value={stats?.followUpsNeeded ?? '—'} />
      </div>

      <div className="bg-white border border-gray-200 rounded-xl">
        <div className="p-4 border-b border-gray-100">
          <SearchBar
            value={search}
            onChange={(v) => { setSearch(v); setPage(1); }}
            placeholder="Search leads..."
          />
        </div>
        {loading ? (
          <p className="p-6 text-gray-400 text-sm">Loading...</p>
        ) : (
          <>
            <DataTable columns={columns} rows={leads} />
            <Pagination page={page} pageSize={PAGE_SIZE} total={total} onPageChange={setPage} />
          </>
        )}
      </div>

      <AddLeadModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onLeadAdded={handleLeadAdded}
      />
    </div>
  );
}
