import { useEffect, useState, useCallback } from 'react';
import { Download, Plus } from 'lucide-react';
import StatCard from '../../components/common/StatCard';
import DataTable from '../../components/common/DataTable';
import StatusBadge from '../../components/common/StatusBadge';
import Pagination from '../../components/common/Pagination';
import AddPaymentModal from '../../components/payments/AddPaymentModal';
import { paymentApi } from '../../api/paymentApi';

const PAGE_SIZE = 10;

export default function Payments() {
  const [payments, setPayments] = useState([]);
  const [stats, setStats] = useState(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchStats = useCallback(() => {
    paymentApi.getStats?.()
      .then(setStats)
      .catch((err) => console.error('Failed to load stats:', err));
  }, []);

  const fetchPayments = useCallback(() => {
    setLoading(true);
    paymentApi.list({ page, pageSize: PAGE_SIZE })
      .then(({ data, count }) => {
        setPayments(data || []);
        setTotal(count || 0);
      })
      .catch((err) => console.error('Failed to load payments:', err))
      .finally(() => setLoading(false));
  }, [page]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  const handlePaymentAdded = () => {
    fetchPayments();
    fetchStats();
  };

  const handleExport = () => {
    if (!payments.length) return;
    const headers = ['ID', 'Member', 'Membership Plan', 'Amount', 'Method', 'Date', 'Status'];
    const rows = payments.map((r) => [
      r.transaction_code || r.id?.slice(0, 8) || '',
      r.members?.name || (r.members?.first_name ? `${r.members.first_name} ${r.members.last_name || ''}`.trim() : '—'),
      r.membership_plans?.name || '—',
      r.amount || 0,
      r.method || r.payment_method || '—',
      new Date(r.paid_at || r.created_at).toLocaleDateString(),
      r.status || ''
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `payments_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const columns = [
    { 
      key: 'transaction_code', 
      label: 'ID',
      render: (r) => r.transaction_code || r.id?.slice(0, 8) || '—'
    },
    { 
      key: 'member', 
      label: 'Member', 
      render: (r) => r.members?.name || (r.members?.first_name ? `${r.members.first_name} ${r.members.last_name || ''}`.trim() : '—') 
    },
    { 
      key: 'plan', 
      label: 'Membership', 
      render: (r) => r.membership_plans?.name || '—' 
    },
    { 
      key: 'amount', 
      label: 'Amount', 
      render: (r) => `$${Number(r.amount || 0).toFixed(2)}` 
    },
    { 
      key: 'method', 
      label: 'Method', 
      render: (r) => <span className="capitalize">{(r.method || r.payment_method || '—').replace('_', ' ')}</span> 
    },
    { 
      key: 'paid_at', 
      label: 'Date', 
      render: (r) => new Date(r.paid_at || r.created_at).toLocaleDateString() 
    },
    { 
      key: 'status', 
      label: 'Status', 
      render: (r) => <StatusBadge status={r.status || 'completed'} /> 
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Payments</h2>
          <p className="text-gray-500 text-sm">Track member payments and transactions.</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={handleExport}
            className="flex items-center gap-2 border border-gray-300 text-sm font-medium px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
          >
            <Download size={16} /> Export
          </button>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors cursor-pointer"
          >
            <Plus size={16} /> New Payment
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Revenue" value={`$${(stats?.totalRevenue ?? 0).toLocaleString()}`} />
        <StatCard label="Total This Month" value={`$${(stats?.totalMonth ?? 0).toLocaleString()}`} />
        <StatCard label="Pending" value={`$${(stats?.pending ?? 0).toLocaleString()}`} />
        <StatCard label="Refunds" value={`$${(stats?.refunds ?? 0).toLocaleString()}`} />
      </div>

      <div className="bg-white border border-gray-200 rounded-xl">
        {loading ? (
          <p className="p-6 text-gray-400 text-sm">Loading...</p>
        ) : (
          <>
            <DataTable columns={columns} rows={payments} />
            <Pagination page={page} pageSize={PAGE_SIZE} total={total} onPageChange={setPage} />
          </>
        )}
      </div>

      <AddPaymentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onPaymentAdded={handlePaymentAdded}
      />
    </div>
  );
}
