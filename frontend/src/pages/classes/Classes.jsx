import { useEffect, useState, useCallback } from 'react';
import { Plus } from 'lucide-react';
import StatCard from '../../components/common/StatCard';
import DataTable from '../../components/common/DataTable';
import StatusBadge from '../../components/common/StatusBadge';
import AddClassModal from '../../components/classes/AddClassModal';
import { classApi } from '../../api/classApi';

export default function Classes() {
  const [classes, setClasses] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchStats = useCallback(() => {
    classApi.getStats?.().then(setStats).catch(() => {});
  }, []);

  const fetchClasses = useCallback(() => {
    setLoading(true);
    classApi.list({ pageSize: 50 })
      .then(({ data }) => setClasses(data || []))
      .catch((err) => console.error('Failed to load classes:', err))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchStats();
    fetchClasses();
  }, [fetchStats, fetchClasses]);

  const handleClassAdded = () => {
    fetchClasses();
    fetchStats();
  };

  const columns = [
    { key: 'name', label: 'Class Name', render: (r) => <span className="font-medium">{r.name}</span> },
    { key: 'trainer', label: 'Trainer', render: (r) => r.trainers?.name || r.trainers?.first_name ? `${r.trainers.first_name || ''} ${r.trainers.last_name || ''}`.trim() : '—' },
    { key: 'scheduled_at', label: 'Date & Time', render: (r) => (r.scheduled_at || r.schedule_time) ? new Date(r.scheduled_at || r.schedule_time).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }) : '—' },
    { key: 'duration_minutes', label: 'Duration', render: (r) => `${r.duration_minutes || 60} min` },
    { key: 'capacity', label: 'Capacity', render: (r) => `${r.booked_count ?? 0}/${r.capacity}` },
    { key: 'status', label: 'Status', render: (r) => <StatusBadge status={r.status || 'Scheduled'} /> },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Classes</h2>
          <p className="text-gray-500 text-sm">Manage gym classes, schedules and capacity.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors cursor-pointer"
        >
          <Plus size={16} /> Add Class
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <StatCard label="Today's Classes" value={stats?.todaysClasses ?? '—'} />
        <StatCard label="Total Bookings" value={stats?.totalBookings ?? '—'} />
        <StatCard label="Available Slots" value={stats?.availableSlots ?? '—'} />
        <StatCard label="Fully Booked" value={stats?.fullyBooked ?? '—'} />
      </div>

      <div className="bg-white border border-gray-200 rounded-xl">
        {loading ? (
          <p className="p-6 text-gray-400 text-sm">Loading...</p>
        ) : (
          <DataTable columns={columns} rows={classes} />
        )}
      </div>

      <AddClassModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onClassAdded={handleClassAdded}
      />
    </div>
  );
}
