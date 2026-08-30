import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import StatCard from '../../components/common/StatCard';
import DataTable from '../../components/common/DataTable';
import StatusBadge from '../../components/common/StatusBadge';
import SearchBar from '../../components/common/SearchBar';
import Pagination from '../../components/common/Pagination';
import AddTrainerModal from '../../components/trainers/AddTrainerModal';
import { trainerApi } from '../../api/trainerApi';

const PAGE_SIZE = 10;

export default function TrainersList() {
  const navigate = useNavigate();
  const [trainers, setTrainers] = useState([]);
  const [stats, setStats] = useState(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchStats = useCallback(() => {
    trainerApi.getStats?.().then(setStats).catch(() => {});
  }, []);

  const fetchTrainers = useCallback(() => {
    setLoading(true);
    trainerApi.list({ page, pageSize: PAGE_SIZE, search })
      .then(({ data, count }) => {
        setTrainers(data || []);
        setTotal(count || 0);
      })
      .catch((err) => console.error('Failed to fetch trainers:', err))
      .finally(() => setLoading(false));
  }, [page, search]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    fetchTrainers();
  }, [fetchTrainers]);

  const handleTrainerAdded = () => {
    fetchTrainers();
    fetchStats();
  };

  const columns = [
    { key: 'name', label: 'Trainer', render: (r) => <span className="font-medium">{r.name || `${r.first_name || ''} ${r.last_name || ''}`.trim()}</span> },
    { key: 'trainer_code', label: 'Trainer ID', render: (r) => r.trainer_code || r.id?.slice(0, 8) },
    { key: 'specialization', label: 'Specialization' },
    { key: 'email', label: 'Contact', render: (r) => r.email || r.phone || '—' },
    { key: 'experience_years', label: 'Experience', render: (r) => r.experience_years ? `${r.experience_years} years` : '—' },
    { key: 'status', label: 'Status', render: (r) => <StatusBadge status={r.status || 'Active'} /> },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Trainers</h2>
          <p className="text-gray-500 text-sm">Manage trainers, schedules, and assignments.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors cursor-pointer"
        >
          <Plus size={16} /> Add Trainer
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Total Trainers" value={stats?.total ?? trainers.length ?? '—'} />
        <StatCard label="Active Trainers" value={stats?.active ?? trainers.length ?? '—'} />
        <StatCard label="On Leave" value={stats?.onLeave ?? '0'} />
      </div>

      <div className="bg-white border border-gray-200 rounded-xl">
        <div className="p-4 border-b border-gray-100">
          <SearchBar value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search trainers..." />
        </div>
        {loading ? (
          <p className="p-6 text-gray-400 text-sm">Loading...</p>
        ) : (
          <>
            <DataTable columns={columns} rows={trainers} onRowClick={(r) => navigate(`/trainers/${r.id}`)} />
            <Pagination page={page} pageSize={PAGE_SIZE} total={total} onPageChange={setPage} />
          </>
        )}
      </div>

      <AddTrainerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onTrainerAdded={handleTrainerAdded}
      />
    </div>
  );
}
