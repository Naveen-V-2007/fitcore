import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import StatCard from '../../components/common/StatCard';
import DataTable from '../../components/common/DataTable';
import StatusBadge from '../../components/common/StatusBadge';
import AddPlanModal from '../../components/memberships/AddPlanModal';
import { membershipApi } from '../../api/membershipApi';

export default function MembershipsList() {
  const navigate = useNavigate();
  const [plans, setPlans] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchStats = useCallback(() => {
    membershipApi.getStats?.()
      .then(setStats)
      .catch((err) => console.error('Failed to load membership stats:', err));
  }, []);

  const fetchPlans = useCallback(() => {
    setLoading(true);
    membershipApi.list?.({ pageSize: 50 })
      .then(({ data }) => setPlans(data || []))
      .catch(() => {
        membershipApi.getAll?.()
          .then((data) => setPlans(data || []))
          .catch((err) => console.error('Failed to load plans:', err));
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchStats();
    fetchPlans();
  }, [fetchStats, fetchPlans]);

  const handlePlanAdded = () => {
    fetchPlans();
    fetchStats();
  };

  const columns = [
    { 
      key: 'name', 
      label: 'Plan Name', 
      render: (r) => <span className="font-medium">{r.name}</span> 
    },
    { 
      key: 'plan_code', 
      label: 'Plan ID', 
      render: (r) => r.plan_code || r.id?.slice(0, 8) || '—' 
    },
    { 
      key: 'duration_days', 
      label: 'Duration', 
      render: (r) => r.duration_days ? `${r.duration_days} Days` : `${(r.duration_months || 1) * 30} Days` 
    },
    { 
      key: 'price', 
      label: 'Price', 
      render: (r) => `$${Number(r.price || 0).toFixed(2)}` 
    },
    { 
      key: 'renewal_rate', 
      label: 'Renewal Rate', 
      render: (r) => r.renewal_rate ? `${r.renewal_rate}%` : '—' 
    },
    { 
      key: 'status', 
      label: 'Status', 
      render: (r) => <StatusBadge status={r.status || (r.is_active === false ? 'Inactive' : 'Active')} /> 
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Memberships</h2>
          <p className="text-gray-500 text-sm">Manage membership plans, pricing, and availability.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors cursor-pointer"
        >
          <Plus size={16} /> Add Membership
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Active Plans" value={stats?.activePlans ?? plans.length ?? '—'} />
        <StatCard label="Active Subscriptions" value={stats?.activeSubscriptions ?? '—'} />
        <StatCard label="Monthly Recurring Revenue" value={`$${(stats?.monthlyRecurringRevenue ?? 0).toLocaleString()}`} />
      </div>

      <div className="bg-white border border-gray-200 rounded-xl">
        {loading ? (
          <p className="p-6 text-gray-400 text-sm">Loading...</p>
        ) : (
          <DataTable
            columns={columns}
            rows={plans}
            onRowClick={(r) => navigate(`/memberships/${r.id}`)}
          />
        )}
      </div>

      <AddPlanModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onPlanAdded={handlePlanAdded}
      />
    </div>
  );
}
